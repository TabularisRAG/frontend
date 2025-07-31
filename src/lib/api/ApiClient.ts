export default abstract class APIClient {
    protected serverURL = process.env.BACKEND_URL || "http://localhost:8000"
}
