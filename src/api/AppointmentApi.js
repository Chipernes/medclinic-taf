export class AppointmentApi {
  constructor(client) { this.client = client; }
  doctors() { return this.client.get('/api/doctors'); }
  book(appointment, opts) { return this.client.post('/api/appointments', appointment, opts); }
  cancel(id) { return this.client.delete(`/api/appointments/${id}`); }
}
