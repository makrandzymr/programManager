const chai = require('chai');
const request = require('supertest');
const userRoute = require("../routes/users");
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
chai.use(chaiHttp);

var ctrl = require('../controllers/user.controller');
var response = {
    viewName: ""
    , data : {}
    , render: function(view, viewData) {
        this.viewName = view;
        this.data = viewData;
    }
};
const user = {
                username: "mac",
                password: "111111"
            };
    

// it('should return message on rendering', function() {
//     return request(app)
//       .post('/users/login/')
//                   .send(user)

//       .then(function(response){
//           console.log(response);
//         //   expect(response.text).to.contain('Welcome Home Dude !!');
//       })
//   });

//   describe('home route', function() {
//     it('should return a rendered response', function() {
//       var req = {dody: {username: 'mac', password: '111111'}};
//       var res = { render: sinon.spy() };
  
//       // Also return the promise here, and add an assertion to the chain.
//       return ctrl.login(req, res).then(function() {
//           console.log(res);
//         // expect(res.render.calledOnce).to.be.true;
//       });
//     });
//   });
  
// describe('/GET user', () => {
//     it('it should Get current users', (done) => {
//         const user = {
//             username: "mac",
//             password: "111111"
//         };

//         request(app)
//             .post('/users/login/')
//             .set('Accept', 'application/json')
//             .send(user)
//             // .expect('Content-Type', /json/)
//             // .expect('Content-Length', '15')
//             .expect(200)
//             .end(function(err, res) {
//                 console.log('----res', res);
//                 if (err) throw err;
//                 done();
//             });
    // });
// });