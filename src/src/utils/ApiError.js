function ApiError(status, message = "something went wrong", errors = [], stack = "") {
     const error = new Error(message)

     error.status = status
     error.data = null
     error.success = false
     error.errors = errors

     if (stack) {
          error.stack = stack
     } else {
          Error.captureStackTrace(error, ApiError)
     }

     return error
}

export default ApiError
