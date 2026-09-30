class ModelRouter:
    def select_best_model(self, benchmark_results):
        classical_results = [r for r in benchmark_results if r["model_family"] == "classical"]
        quantum_results = [r for r in benchmark_results if r["model_family"] == "quantum"]
        
        if not classical_results:
            return None
            
        best_classical = max(classical_results, key=lambda x: x["roc_auc"])
        
        if not quantum_results:
            return {
                "selected_model": best_classical["model_name"],
                "model_family": "classical",
                "reason": "No quantum results available for comparison.",
                "key_metrics": {"roc_auc": best_classical["roc_auc"], "f1": best_classical["f1"]},
                "quantum_benefit": "insufficient_data",
                "evidence": ["Only classical models were evaluated."]
            }
            
        best_quantum = max(quantum_results, key=lambda x: x["roc_auc"])
        
        c_auc = best_classical["roc_auc"]
        q_auc = best_quantum["roc_auc"]
        
        evidence = [f"Best classical model ({best_classical['model_name']}) achieved AUC: {c_auc:.3f}"]
        evidence.append(f"Best quantum model ({best_quantum['model_name']}) achieved AUC: {q_auc:.3f}")
        
        if q_auc > c_auc + 0.02:
            qb = "quantum_wins"
            sel = best_quantum
            reason = "Quantum model outperformed classical by significant margin."
        elif c_auc > q_auc + 0.02:
            qb = "classical_wins"
            sel = best_classical
            reason = "Classical model outperformed quantum."
        else:
            qb = "comparable"
            if best_quantum["f1"] > best_classical["f1"]:
                sel = best_quantum
                reason = "Comparable AUC, quantum wins on F1."
            else:
                sel = best_classical
                reason = "Comparable AUC, classical wins tiebreaker on F1."
                
        if best_quantum["sensitivity"] > best_classical["sensitivity"] + 0.05:
            evidence.append("Note: Quantum model showed notably higher sensitivity.")
            
        return {
            "selected_model": sel["model_name"],
            "model_family": sel["model_family"],
            "reason": reason,
            "key_metrics": {"roc_auc": sel["roc_auc"], "f1": sel["f1"], "sensitivity": sel["sensitivity"]},
            "quantum_benefit": qb,
            "evidence": evidence
        }
