export const openapi = {
 openapi: '3.0.3',
 info: { title: 'Sticker Club Local API', version: '0.1.0', description: 'Self-managed local development API. Checkout and orders are not integrated yet.' },
 servers: [{ url: 'http://localhost:5000' }],
 components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
 paths: {
  '/api/health': { get: { summary: 'Health check', responses: { '200': { description: 'Service running' } } } },
  '/api/auth/register': { post: { summary: 'Register customer', requestBody: { required: true, content: { 'application/json': { schema: { type:'object',required:['name','email','password'],properties:{name:{type:'string'},email:{type:'string',format:'email'},password:{type:'string',minLength:12}} } } } }, responses: { '201': { description: 'Account created' }, '409': { description:'Email already exists' } } } },
  '/api/auth/login': { post: { summary: 'Login', requestBody: { required:true,content:{'application/json':{schema:{type:'object',required:['email','password'],properties:{email:{type:'string'},password:{type:'string'}}}}}},responses:{'200':{description:'Authenticated'},'401':{description:'Invalid credentials'}}} },
  '/api/auth/refresh': { post: { summary: 'Rotate HTTP-only refresh cookie', responses: { '200': { description:'New access token' },'401':{description:'Expired session'} } } },
  '/api/auth/logout': { post: { summary: 'Revoke refresh token', responses: { '200': {description:'Logged out'} } } },
  '/api/auth/forgot-password': { post: {summary:'Request reset (development-only terminal delivery)',responses:{'200':{description:'Accepted'}}} },
  '/api/auth/reset-password': { post: {summary:'Use one-time reset token',responses:{'200':{description:'Password updated'}}} },
  '/api/me': {get:{summary:'Get current user',security:[{bearerAuth:[]}],responses:{'200':{description:'Profile'},'401':{description:'Unauthorized'}}},patch:{summary:'Update profile',security:[{bearerAuth:[]}],responses:{'200':{description:'Updated'}}}},
  '/api/me/addresses':{get:{summary:'List own addresses',security:[{bearerAuth:[]}],responses:{'200':{description:'Addresses'}}},post:{summary:'Create address',security:[{bearerAuth:[]}],responses:{'201':{description:'Created'}}}},
  '/api/me/orders':{get:{summary:'List own orders',security:[{bearerAuth:[]}],responses:{'200':{description:'Orders'}}}},
  '/api/products':{get:{summary:'List active backend products',responses:{'200':{description:'Products'}}}},
  '/api/admin/stats':{get:{summary:'Administrator statistics',security:[{bearerAuth:[]}],responses:{'200':{description:'Database totals'},'403':{description:'Forbidden'}}}},
  '/api/admin/products':{get:{summary:'List products',security:[{bearerAuth:[]}],responses:{'200':{description:'Products'}}},post:{summary:'Create product',security:[{bearerAuth:[]}],responses:{'201':{description:'Created'}}}},
  '/api/admin/orders':{get:{summary:'List orders',security:[{bearerAuth:[]}],responses:{'200':{description:'Orders'}}}}
 }
} as const;
