export default abstract class APIClient {
    protected serverURL = process.env.BACKEND_URL || "http://localhost:8000"
    protected WEB_SOCKET_BASE_URL = `ws://localhost:8000/api`;
}
