class ErrorHandler {
	public hadError = false;

	error(line: number, message: string) {
		this.report(line, "", message);
	}

	report(line: number, where: string, message: string) {
		console.error(`[line ${line}] Error ${where}: ${message}`);
		this.hadError = true;
	}

	hasError() {
		return this.hadError;
	}
}

const errorHandler = new ErrorHandler();
export { errorHandler };
