var net = require('net');
var vm = require('vm');
var fs = require('fs');
var readline = require('readline');

var flag = fs.readFileSync('flag.txt').toString().trim();
var source_code = fs.readFileSync('calculator.js').toString().trim();

// Creating a TCP server
net.createServer(function onConnect(c) {
  // Proper error handling
  c.on('error', function() {});

  // Readline will read lines on-by-one
  var rl = readline.createInterface({ input: c, output: c });

  // Welcome message
  c.write('Welcome to the Completely Secure Online Calculator.\n');
  c.write('Please send the content of flag.txt to gabor@molnar.es if you somehow manage to read it.\n');
  c.write('The code is open source in case you want to run it locally (you will need node.js for that):\n\n');
  c.write(source_code.replace(/^/mg, '    ') + '\n\n');
  c.write('Let\'s start. Why not try something simple first? Like 1+2, 3+4, 1/0 or 1[0].\n\n')

  // Reading one line of input and evaluating the expression
  function calculate_expression() {
    rl.question("> ", function(expression) {
      // Testing the validity of the expression.
      if (/^[0-9.+-/%*<>!=[\]() ]*$/.test(expression)) {
        // We are going to execute this JS code in a sandbox
        var js = 'f="' + flag + '";"";' + expression;

        // The actual execution and error handling
        try {
          var result = String(vm.runInNewContext(js)) + '\n';
        } catch(e) {
          var result = String(e) + '\n';
        }

        // Logging
        process.stdout.write(c.remoteAddress + ':' + c.remotePort + ' ' + expression + ' -> ' + result);

        // Sending the result
        c.write(result);
      }

      // Dealing with nasty inputs
      else {
        c.write('The expression must only contain the following characters: 0123456789.+-/%*<>!=[]()\n');
      }

      // Waiting for the next expression
      calculate_expression();
    });
  }
  calculate_expression();
}).listen(12345);
