let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

const DEFAULT_URL = 'http://localhost:8080';
const URL = process.env.API_URL || DEFAULT_URL;

describe('Paragraph', () => {
  beforeEach((done) => {
    chai.request(URL).delete('/paragraph/my-paragraph').end(() => done());
  });

  describe('API', () => {

    it('should be reachable', (done) => {
      chai.request(URL)
        .get('/')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res.status).to.equal(200);

          done();
        })
    });

  })

  describe('GET /paragraph/:slug', () => {

    it('should return 404 for unknown paragraph', (done) => {
      getParagraph('my-paragraph').then((res) => {
        expect(res.status).to.equal(404);

        done();
      })
    });

    it('should return initial structure', function(done) {
      createParagraph('my-paragraph', 2).then((res) => {
        expect(res).to.have.property('status', 200);

        getParagraph('my-paragraph').then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.eql({
            complete: false,
            sentences: [null, null],
          });

          done();
        });
      });
    });

  });

  describe('POST /paragraph/:slug/sentence/:idx', () => {

    it('should add sentence to paragraph', (done) => {
      createParagraph('my-paragraph', 2).then((res) => {
        createSentence('my-paragraph', 0, 'Hello World!').then((res) => {
          expect(res.status).to.equal(200);

          getParagraph('my-paragraph').then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.eql({
              complete: false,
              sentences: [
                'Hello World!',
                null,
              ]
            });

            done();
          });
        });
      });
    });

    it('should mark paragraph complete when all sentences added', (done) => {
      createParagraph('my-paragraph', 2).then((res) => {
        createSentence('my-paragraph', 0, 'Hello World!').then((res) => {
          createSentence('my-paragraph', 1, 'Goodbye!').then((res) => {

            getParagraph('my-paragraph').then((res) => {
              expect(res.status).to.equal(200);
              expect(res.body).to.eql({
                complete: true,
                sentences: [
                  'Hello World!',
                  'Goodbye!'
                ]
              });

              done();
            });
          });
        });
      });
    });

    it('should support deleting sentences', (done) => {
      createParagraph('my-paragraph', 1).then((res) => {
        createSentence('my-paragraph', 0, 'Hello World!').then((res) => {

          getParagraph('my-paragraph').then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.eql({
              complete: true,
              sentences: [
                'Hello World!',
              ]
            });

            deleteSentence('my-paragraph', 0).then((res) => {
              expect(res.status).to.equal(200);

              getParagraph('my-paragraph').then((res) => {
                expect(res.body).to.eql({
                  complete: false,
                  sentences: [null]
                });

                done();
              });
            });
          });
        });
      });
    });

    it('should not add sentence to unknown paragraph', (done) => {
      createSentence('unknown-paragraph', 0, 'Hello World!').then((res) => {
        expect(res.status).to.equal(404);

        done();
      });
    });

    it('should reject invalid sentence index', (done) => {
      createParagraph('my-paragraph', 2).then((res) => {
        createSentence('my-paragraph', 3, 'Hello World!').then((res) => {
          expect(res.status).to.equal(400);

          done();
        });
      });
    });

  });

  describe('DELETE /paragraph/:slug', () => {

    it('should delete paragraph', (done) => {
      getParagraph('my-paragraph').then((res) => {
        expect(res.status).to.equal(404);

        createParagraph('my-paragraph', 2).then((res) => {
          expect(res.status).to.equal(200);

          deleteParagraph('my-paragraph').then((res) => {
            expect(res.status).to.equal(200);

            getParagraph('my-paragraph').then((res) => {
              expect(res.status).to.equal(404);

              done();
            });
          });
        });
      });
    });
  });

});

function getParagraph(name) {
  return new Promise((resolve, reject) => {
    chai.request(URL)
      .get(`/paragraph/${name}`)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
  });
}

function createParagraph(name, numSentences) {
  return new Promise((resolve, reject) => {
    chai.request(URL)
      .post(`/paragraph/${name}`)
      .send({ numSentences })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
  });
}

function deleteParagraph(name) {
  return new Promise((resolve, reject) => {
    chai.request(URL)
      .delete(`/paragraph/${name}`)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
  });
}

function createSentence(name, idx, sentence) {
  return new Promise((resolve, reject) => {
    chai.request(URL)
      .post(`/paragraph/${name}/sentence/${idx}`)
      .send({ sentence })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
  });
}

function deleteSentence(name, idx) {
  return new Promise((resolve, reject) => {
    chai.request(URL)
      .delete(`/paragraph/${name}/sentence/${idx}`)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
  });
}


