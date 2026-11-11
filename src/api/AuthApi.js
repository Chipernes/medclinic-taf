// Business Logic Layer: API-клієнти предметної області поверх Core ApiClient.
export class AuthApi {
  constructor(client) { this.client = client; }
  login(login, password) { return this.client.post('/api/auth/login', { login, password }, { token: null }); }
}
