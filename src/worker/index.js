const chalk = require('chalk');
const sundayDriver = require('sunday-driver');
const parsePage = require('./01-parsePage');
const parseWiki = require('./02-parseWiki');
const jsonfn = require('jsonfn').JSONfn;
const fs = require('fs');

const doSection = async (optionStr, workerCount, workerNum) => {
  const options = jsonfn.parse(optionStr);
  const percent = 100 / workerCount;
  const start = percent * workerNum;
  const end = start + percent;
  this.counts = {
    pages: 0,
    redirects: 0,
    disambig: 0
  };
  this.results = {};
  this.titles = {};
  this.categories = {};
  this.sections = {};
  this.logger = setInterval(() => {
    options.log(this, fs);
  }, 2000);

  const driver = {
    file: options.file,
    start: `${start}%`,
    end: `${end}%`,
    splitter: '</page>',
    each: (xml, resume) => {
      // pull-out sections from this xml
      let page = parsePage(xml, this);
      if (page !== null) {
        if (options.verbose === true) {
          console.log('   #' + workerNum + '  - ' + page.title);
        }
        //parse the page into json
        page = parseWiki(page, options, this);
      }
      this.counts.pages += 1;
      resume();
    }
  };
  const p = sundayDriver(driver);
  p.catch(err => {
    console.log(chalk.red('\n\n========== Worker error!  ====='));
    console.log('🚨       worker #' + workerNum + '           🚨');
    console.log(err);
    console.log('\n\n');
  });
  p.then(async () => {
    //on done
    clearInterval(this.logger);
    // insert the remaining pages
    console.log('\n');
    console.log(`    💪  worker #${workerNum} has finished 💪 `);
    process.send({
      type: 'workerDone',
      pid: process.pid
    });
  });
  return process.pid;
};

module.exports = {
  doSection: doSection
};
