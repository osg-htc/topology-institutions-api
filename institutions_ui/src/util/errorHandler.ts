export function errorHandler(error: ErrorJsonResponse, errorMessage: string) {

	// Handle array error responses (like 422 validation errors)
	if (error.detail && Array.isArray(error.detail)) {
		errorMessage = error.detail
				.map((err) => err.msg || JSON.stringify(err))
				.join('\n');
	} else if (error.detail && typeof error.detail === 'string') {
		// Handle string error messages
		errorMessage = error.detail;
	}

	alert(errorMessage);
}


interface ErrorJsonResponse {
	detail: string | Array<{ msg: string }>;
}

export default errorHandler;
