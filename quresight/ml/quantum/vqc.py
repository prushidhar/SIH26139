import pennylane as qml
from pennylane import numpy as np
import joblib

class VQCClassifier:
    def __init__(self, n_qubits=4, n_layers=2, random_state=42):
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        self.random_state = random_state
        self.dev = qml.device("default.qubit", wires=n_qubits)
        self.weights = np.random.uniform(low=-np.pi, high=np.pi, size=(n_layers, n_qubits, 3), requires_grad=True)
        self.n_params = n_layers * n_qubits * 3
        
        @qml.qnode(self.dev, interface="autograd")
        def circuit(weights, x):
            for i in range(self.n_qubits):
                qml.RX(x[i], wires=i)
            qml.StronglyEntanglingLayers(weights, wires=range(self.n_qubits))
            return qml.expval(qml.PauliZ(0))
        self.circuit = circuit

    def fit(self, X_train, y_train, n_epochs=10, learning_rate=0.1, batch_size=32):
        opt = qml.AdamOptimizer(learning_rate)
        # map y from 0,1 to -1,1
        y_train_mapped = np.where(y_train == 0, -1, 1)
        n_samples = len(X_train)
        
        def cost(weights, X_b, Y_b):
            predictions = np.array([self.circuit(weights, x) for x in X_b])
            return np.mean((predictions - Y_b) ** 2)
            
        history = []
        import numpy as std_np
        for epoch in range(n_epochs):
            # Sample random mini-batch
            batch_idx = std_np.random.choice(n_samples, min(batch_size, n_samples), replace=False)
            X_b = X_train[batch_idx]
            Y_b = y_train_mapped[batch_idx]
            
            self.weights, cost_val = opt.step_and_cost(lambda w: cost(w, X_b, Y_b), self.weights)
            history.append({"epoch": epoch+1, "cost": float(cost_val)})
        return history

    def predict(self, X):
        preds = [float(self.circuit(self.weights, x)) for x in X]
        import numpy as std_np
        return std_np.where(std_np.array(preds) > 0, 1, 0).flatten().astype(int)

    def predict_proba(self, X):
        preds = [float(self.circuit(self.weights, x)) for x in X]
        import numpy as std_np
        preds_arr = std_np.array(preds)
        probs = 1 / (1 + std_np.exp(-preds_arr))
        return std_np.column_stack((1-probs, probs))

    def get_circuit_info(self):
        return {
            "n_qubits": self.n_qubits,
            "n_layers": self.n_layers,
            "circuit_depth": self.n_layers,
            "n_params": self.n_params,
            "encoding": "Angle Encoding (RX)",
            "backend": "default.qubit",
            "simulator_label": "PennyLane default.qubit (Statevector Simulator)"
        }

    def save(self, path):
        joblib.dump({"n_qubits": self.n_qubits, "n_layers": self.n_layers, "weights": self.weights}, path)

    @classmethod
    def load(cls, path):
        data = joblib.load(path)
        instance = cls(n_qubits=data["n_qubits"], n_layers=data["n_layers"])
        instance.weights = data["weights"]
        return instance
