import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig,
} from "axios";
import { Store } from "@reduxjs/toolkit";
import { refreshUserToken, logoutUser } from "@/features/auth/authSlice";
import { AppDispatch } from "@/app/store";

// API URL
const API_URL = "https://localhost:7100/api";

// Create axios instance
const instance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': "application/json",
  },
  withCredentials: true, // Cookie bazlı auth için gerekli
});

// Token refresh management
let isRefreshing = false;
let refreshSubscribers: Array<(success: boolean) => void> = [];
let store: Store<any, any> & { dispatch: AppDispatch };

// İsteği izleyen fonksiyonlar
const requestTracker = (() => {
  const retriedRequests = new Set<string>();
  
  // İstek URL'sinden benzersiz bir tanımlayıcı oluştur
  const getRequestId = (config: any): string => {
    if (!config) return '';
    return `${config.method || 'get'}-${config.url}-${Date.now()}`;
  };
  
  return {
    isRetried: (config: any): boolean => {
      const requestId = getRequestId(config);
      return retriedRequests.has(requestId);
    },
    
    markAsRetried: (config: any): void => {
      const requestId = getRequestId(config);
      retriedRequests.add(requestId);
      
      // Cache boyutunu sınırla
      if (retriedRequests.size > 100) {
        const firstItem = retriedRequests.values().next().value;
        retriedRequests.delete(firstItem);
      }
    },
    
    clear: (): void => {
      retriedRequests.clear();
    }
  };
})();

// Kullanıcının auth durumunu Redux store'dan kontrol et
const isUserLoggedIn = (): boolean => {
  const state = store.getState();
  return state?.auth?.isAuthenticated || false;
};

// Token refresh tamamlandığında bekleyen istekleri bilgilendir
const onTokenRefreshed = (success: boolean) => {
  refreshSubscribers.forEach(callback => callback(success));
  refreshSubscribers = [];
};

// Token refresh bekleyen bir istek ekle
const addRefreshSubscriber = (callback: (success: boolean) => void) => {
  refreshSubscribers.push(callback);
};

// Doğrudan API çağrısı yaparak token yenileme - SADECE 401 hatası ve
// oturum açma işlemlerinde kullanılmalı
const refreshTokenDirectly = async (): Promise<boolean> => {
  // Halihazırda refresh işlemi yapılıyorsa, o işlemin sonucunu bekle
  if (isRefreshing) {
    return new Promise((resolve) => {
      addRefreshSubscriber((success) => {
        resolve(success);
      });
    });
  }
  
  isRefreshing = true;
  
  try {
    console.log('401 hatası algılandı: JWT token yenileniyor...');
    
    // Temel axios instance'ını kullanmak yerine yeni bir istek oluştur
    // Bu sayede interceptor'lar tetiklenmez ve sonsuz döngü oluşmaz
    const refreshResponse = await axios({
      method: 'post',
      url: `${API_URL}/Auth/refresh-token`,
      data: {}, // Boş body - cookie'deki refresh token kullanılacak
      withCredentials: true, // Cookie kullanımı için gerekli
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Token yenileme başarılı:', refreshResponse.status);
    onTokenRefreshed(true);
    return true;
  } catch (error) {
    console.error('Token yenileme hatası:', error);
    onTokenRefreshed(false);
    
    // Refresh token da geçersizse kullanıcıyı çıkış yaptır
    store.dispatch(logoutUser());
    return false;
  } finally {
    isRefreshing = false;
  }
};

// Uygulama başlangıcında auth kontrolü
export const checkAuthenticationOnStartup = async (): Promise<void> => {
  console.log('Kimlik doğrulama kontrolü yapılıyor...');
  
  try {
    // Redux state'indeki auth durumunu kontrol et
    const state = store.getState();
    const isAuthenticated = state?.auth?.isAuthenticated || false;
    
    // Eğer state'de auth yoksa token yenilemeyi deneme
    // Kullanıcı giriş yapmadıysa veya önceden giriş yapmışsa direkt current-user
    // API'sini çağıracağız. Eğer JWT süresi dolduysa, 401 mekanizması çalışacak.
    if (!isAuthenticated) {
      console.log('Kullanıcı oturum açmamış veya uygulama yeni başlatıldı');
    }
  } catch (error) {
    console.error('Auth başlangıç kontrolü hatası:', error);
  }
};

export const initializeAxios = (reduxStore: Store): void => {
  store = reduxStore;

  // Request interceptor - isteği gönderilmeden önce yapılacak işlemler
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      // TenantId ekle (eğer mevcutsa)
      const state = store.getState();
      if (state.auth?.tenant?.id) {
        config.headers.set("X-TenantId", state.auth.tenant.id);
      }
      
      // ÖNEMLİ: Bu kısımda token yenileme işlemi YAPILMIYOR
      // JWT token'ın süresi dolduğunda 401 hatası alınacak ve
      // response interceptor bu durumu otomatik olarak ele alacak
      
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor - istekten sonra yapılacak işlemler
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // 401 hatası olmayan veya config'i olmayan hataları doğrudan reddet
      if (error.response?.status !== 401 || !error.config) {
        return Promise.reject(error);
      }
      
      // İstek bilgilerini al
      const originalRequest = error.config;
      const isRefreshRequest = originalRequest.url?.includes('refresh-token');
      const isLoginRequest = originalRequest.url?.includes('login');
      
      console.log(`401 hatası alındı: ${originalRequest.url}`, {
        isRefreshRequest,
        isLoginRequest,
        isRetried: requestTracker.isRetried(originalRequest)
      });
      
      // Refresh token veya login istekleri için yeniden deneme yapma
      // Ayrıca daha önce yenilenmiş istekler için de yeniden deneme yapma
      if (isRefreshRequest || isLoginRequest || requestTracker.isRetried(originalRequest)) {
        // Refresh token endpointi bile 401 dönüyorsa, kullanıcıyı çıkış yaptır
        if (isRefreshRequest) {
          console.error('Refresh token isteği 401 döndü - oturum tamamen geçersiz');
          store.dispatch(logoutUser());
        }
        return Promise.reject(error);
      }
      
      // İsteği yenilenmiş olarak işaretle
      requestTracker.markAsRetried(originalRequest);
      
      try {
        console.log(`401 hatası sonrası token yenileniyor...`);
        
        // JWT token süresi dolmuş, refresh token ile yenileme yap
        const success = await refreshTokenDirectly();
        
        if (success) {
          console.log('Token yenilendi, orijinal istek tekrarlanıyor');
          // Yeni token ile isteği tekrar gönder
          return instance(originalRequest);
        }
        
        // Token yenileme başarısız
        console.error('Token yenileme başarısız, kullanıcı çıkış yapıyor');
        store.dispatch(logoutUser());
        return Promise.reject(new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.'));
      } catch (refreshError) {
        console.error('401 sonrası token yenileme hatası:', refreshError);
        store.dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }
  );
};

// Uygulama başlangıcında çağrılmalı
export const setupAuthInterceptors = async (reduxStore: Store): Promise<void> => {
  initializeAxios(reduxStore);
  await checkAuthenticationOnStartup();
};

export default instance;