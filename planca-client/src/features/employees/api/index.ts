// Export RTK Query API slice and hooks
export {
  employeesApi,
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetActiveEmployeesQuery,
  useUpdateEmployeeWorkingHoursMutation,
  useUpdateEmployeeServicesMutation,
  useLazyGetEmployeesQuery,
  useLazyGetEmployeeByIdQuery,
} from './employeesAPI';

export { employeesApi as default } from './employeesAPI'; 