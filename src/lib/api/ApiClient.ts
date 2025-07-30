export default abstract class APIClient {
    protected serverURL = import.meta.env.VITE_API_URL || "http://localhost:8000"
}
