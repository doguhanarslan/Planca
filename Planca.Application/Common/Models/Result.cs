using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Common.Models
{
    public class Result
    {
        public bool Succeeded { get; }
        public string[] Errors { get; }

        internal Result(bool succeeded, string[] errors)
        {
            Succeeded = succeeded;
            Errors = errors;
        }

        public static Result Success()
        {
            return new Result(true, Array.Empty<string>());
        }

        public static Result Failure(params string[] errors)
        {
            return new Result(false, errors);
        }
    }

    public class Result<T> : Result
    {
        public T Data { get; }

        private Result(bool succeeded, T data, string[] errors)
            : base(succeeded, errors)
        {
            Data = data;
        }

        public static Result<T> Success(T data)
        {
            return new Result<T>(true, data, Array.Empty<string>());
        }

        public static new Result<T> Failure(params string[] errors)
        {
            return new Result<T>(false, default, errors);
        }
    }
}
