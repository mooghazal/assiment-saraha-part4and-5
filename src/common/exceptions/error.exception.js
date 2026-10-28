



export const ApplicationException= (message="error", options={cause:{status:400}})=>{
    throw new Error(message , options)
}


export const conflictException=(message="conflict" , issues={})=>{
return ApplicationException(
  message,
  {
    cause: {
      status: 409,
      ...issues
    }
  }
)
}

export const NotFoundException=(message="not found" , issues={})=>{
    return ApplicationException(
        message,
       {
         cause: {
           status: 404,
           ...issues
         }
       }
    )
}

export const BadRequestException=(message="bad request exception" , issues={})=>{
    return ApplicationException(
        message,
       {
         cause: {
           status: 400,
           ...issues
         }
       }
    )
}







export const UnauthorizedExecution=(message="unauthorized" , issues={})=>{
    return ApplicationException(
        message,
        {
            cause: {
                status: 401,
                ...issues
            }
        }
    )
}

export const ForbiddenExecution=(message="forbidden" , issues={})=>{
    return ApplicationException(
        message,
        {
            cause: {
                status: 403,
                ...issues
            }
        }
    )
}







export const TooManyRequestsException=(message="too many requests" , issues={})=>{
    return ApplicationException(
        message,
        {
            cause: {
                status: 429, 
                ...issues
            }
        }
    )
}
