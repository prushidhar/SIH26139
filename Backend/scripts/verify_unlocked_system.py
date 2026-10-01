import urllib.request
import json

def test_system():
    # 1. Test Breast Cancer Page HTML
    req = urllib.request.Request('http://localhost:3000/predict/breast-cancer', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        assert 'IBM Quantum (QPU)' in html, 'IBM Quantum button not found!'
        print('PASS: Breast Cancer page IBM Quantum button unlocked!')

    # 2. Test Heart Disease Page HTML
    req = urllib.request.Request('http://localhost:3000/predict/heart-disease', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        assert 'IBM Quantum (QPU)' in html, 'IBM Quantum button not found!'
        print('PASS: Heart Disease page IBM Quantum button unlocked!')

    # 3. Test Real IBM Hardware Inference via Frontend Proxy
    sample_payload = {
        'features': {
            'radius_mean': 17.99,
            'texture_mean': 10.38,
            'perimeter_mean': 122.8,
            'area_mean': 1001.0,
            'smoothness_mean': 0.1184,
            'compactness_mean': 0.2776,
            'concavity_mean': 0.3001,
            'concave_points_mean': 0.1471
        },
        'execution_mode': 'real_ibm_qpu'
    }
    req = urllib.request.Request(
        'http://localhost:3000/api/inference/breast-cancer',
        data=json.dumps(sample_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print('PASS: IBM Real QPU Inference Success:', res.get('success'))
        print('  - Model Name:', res.get('data', {}).get('model_name'))
        print('  - Risk Score:', res.get('data', {}).get('risk_score'))
        print('  - Hardware Receipt:', bool(res.get('data', {}).get('hardware_receipt')))
        if res.get('data', {}).get('hardware_receipt'):
            rcpt = res['data']['hardware_receipt']
            print('  - Backend Target:', rcpt.get('target_system'))
            print('  - Qubits Used:', rcpt.get('qubits_used'))
            print('  - Cryo Temp:', rcpt.get('cryostat_temp_millikelvin'), 'mK')
            print('  - Job ID:', rcpt.get('job_id'))

if __name__ == '__main__':
    test_system()
