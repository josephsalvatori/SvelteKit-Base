

export const handleError = async ({ error, event, status, message }) => {

    const errorId = crypto.randomUUID();

    return {
        message: error.message,
        errorId,
    }
};