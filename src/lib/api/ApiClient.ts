export default abstract class APIClient {
    public serverURL = process.env.BACKEND_URL || 'http://localhost:8000'
}
