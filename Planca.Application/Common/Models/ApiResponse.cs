using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Common.Models
{
    public class ApiResponse<T>
    {
        public bool Succeeded { get; set; }
        public T Data { get; set; }
        public string[] Errors { get; set; }
        public string Message { get; set; }

        public static ApiResponse<T> Success(T data, string message = null)
        {
            return new ApiResponse<T> { Succeeded = true, Data = data, Message = message };
        }

        public static ApiResponse<T> Failure(string[] errors, string message = null)
        {
            return new ApiResponse<T> { Succeeded = false, Errors = errors, Message = message, Data = default(T) };
        }
        public static ApiResponse<T> Failure(string error, string message = null)
        {
            return new ApiResponse<T> { Succeeded = false, Errors = new[] { error }, Message = message, Data = default(T) };
        }
    }
}
