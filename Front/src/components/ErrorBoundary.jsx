import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-8">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <h1 className="text-2xl font-black text-forest-dark mb-3">Algo salió mal</h1>
            <p className="text-moss mb-6">Ocurrió un error inesperado. Intenta recargar la página.</p>
            <button
              className="bg-forest text-white font-bold px-6 py-3 rounded-lg hover:bg-forest-dark transition"
              onClick={() => window.location.reload()}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
