import pennylane as qml
from pennylane import numpy as np
from sklearn.svm import SVC
import joblib

class QuantumKernelSVM:
    def __init__(self, n_qubits=4, random_state=42):
        self.n_qubits = n_qubits
        self.random_state = random_state
        self.dev = qml.device("default.qubit", wires=n_qubits)
        self.svm = SVC(kernel="precomputed", probability=True, random_state=random_state)
        self.X_train_fit = None
        
        @qml.qnode(self.dev)
        def feature_map(x):
            for i in range(self.n_qubits):
                qml.Hadamard(wires=i)
                qml.RZ(x[i], wires=i)
            for i in range(self.n_qubits - 1):
                for j in range(i + 1, self.n_qubits):
                    qml.CNOT(wires=[i, j])
                    qml.RZ((np.pi - x[i]) * (np.pi - x[j]), wires=j)
                    qml.CNOT(wires=[i, j])
            return qml.state()
            
        self.feature_map = feature_map

    def compute_kernel_matrix(self, X1, X2):
        import numpy as std_np
        states1 = std_np.array([self.feature_map(x) for x in X1])
        if X1 is X2 or (len(X1) == len(X2) and std_np.array_equal(X1, X2)):
            states2 = states1
        else:
            states2 = std_np.array([self.feature_map(x) for x in X2])
        gram = std_np.abs(states1 @ states2.conj().T) ** 2
        return std_np.asarray(gram, dtype=std_np.float64)

    def fit(self, X_train, y_train):
        self.X_train_fit = X_train
        K_train = self.compute_kernel_matrix(X_train, X_train)
        self.svm.fit(K_train, y_train)

    def predict(self, X):
        K_test = self.compute_kernel_matrix(X, self.X_train_fit)
        return self.svm.predict(K_test)

    def predict_proba(self, X):
        K_test = self.compute_kernel_matrix(X, self.X_train_fit)
        return self.svm.predict_proba(K_test)

    def get_circuit_info(self):
        return {
            "n_qubits": self.n_qubits,
            "encoding": "ZZFeatureMap-inspired",
            "backend": "default.qubit",
            "simulator_label": "PennyLane default.qubit (Statevector Simulator)"
        }

    def save(self, path):
        joblib.dump({"n_qubits": self.n_qubits, "svm": self.svm, "X_train_fit": self.X_train_fit}, path)

    @classmethod
    def load(cls, path):
        data = joblib.load(path)
        instance = cls(n_qubits=data["n_qubits"])
        instance.svm = data["svm"]
        instance.X_train_fit = data["X_train_fit"]
        return instance
