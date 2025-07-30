export default abstract class APIClient {
    protected serverURL = import.meta.env.API_URL || "http://localhost:8000"
}