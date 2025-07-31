export default abstract class APIClient {

    public serverURL = this.getServerURL()
  
    private getServerURL(): string {
        // For server-side (environment in Docker)
        if (typeof window === 'undefined') {
            return process.env.VITE_API_URL || 'http://localhost:8000'
        }
        // For client-side (browser)
        return import.meta.env.VITE_API_URL || 'http://localhost:8000'
    }
}
