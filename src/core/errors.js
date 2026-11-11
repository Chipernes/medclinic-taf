// Core Layer: власні винятки фреймворку, щоб у звіті було видно, на якому кроці і з якими даними впав тест.
export class KeywordError extends Error {
  constructor(keyword, args, cause) {
    super(`Keyword "${keyword}" failed with args ${JSON.stringify(args)}: ${cause.message}`);
    this.name = 'KeywordError';
    this.keyword = keyword;
    this.cause = cause;
  }
}

export class ApiError extends Error {
  constructor(method, url, cause) {
    super(`HTTP ${method} ${url} failed: ${cause.message}`);
    this.name = 'ApiError';
    this.cause = cause;
  }
}
