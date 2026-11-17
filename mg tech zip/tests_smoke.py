"""Small smoke tests; run with: python -m unittest tests_smoke"""
import os, tempfile, unittest
from fastapi.testclient import TestClient

class AppSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory()
        os.environ['MG_DATABASE']=os.path.join(cls.tmp.name,'test.sqlite3')
        os.environ['MG_SESSION_SECRET']='test-only-secret-change-me'
        import server
        cls.client=TestClient(server.app)
    @classmethod
    def tearDownClass(cls): cls.tmp.cleanup()
    def test_health(self):
        r=self.client.get('/health');self.assertEqual(r.status_code,200);self.assertEqual(r.json()['status'],'ok')
    def test_register_login_progress(self):
        c=TestClient(self.client.app)
        r=c.post('/api/register',json={'email':'tester@example.com','name':'Test User','password':'longpassword123'});self.assertEqual(r.status_code,200)
        self.assertEqual(c.get('/api/me').status_code,200)
        r=c.put('/api/progress',json={'done':[0,1],'check':[0,2]});self.assertEqual(r.status_code,200)
        self.assertEqual(c.get('/api/me').json()['progress']['done'],[0,1])
        c.post('/api/logout');self.assertEqual(c.get('/api/me').status_code,401)
