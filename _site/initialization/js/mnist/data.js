
// Set directory of zip reader
// zip.workerScriptsPath = window.location.pathname.slice(0, -10) + "/js/mnist/zip/";
zip.workerScriptsPath = "/ai-notes/initialization/js/mnist/zip/";

// Download the .zip file, Extract the .csv file, Load into RAM
function extract(file, data, draw) {
  zip.createReader(new zip.HttpReader(file), function(reader) {

    reader.getEntries(function(entries) {

      entries[0].getData(new zip.TextWriter(), function(text) {
        
        process(text, data);

        reader.close(function() {
          // onclose callback
          draw(data["images"].slice(0,100), 0, 0);
        });
      }, function(current, total) {
        // onprogress callback
        d3.select("#percent").text(d3.format(".0%")(current / total));
      });
    }
    );
  }, function(error) {
    // onerror callback
    console.log('error loading ' + file);
  });
}

// sum two arrays
function sum(a, b) {
  for (var i = 0; i < b.length; i++) {
    b[i] += a[i];
  }
  return b;
}

// get mean of an array of arrays
function mean(x) {
  var n = x.length,
      mu = x.reduce(sum).map((a) => a / n);
  return mu;
}

// get std of an array of arrays
function std(x, mu) {
  var neg_mu = mu.map((a) => -a),
      e = x.map((a) => sum(a, neg_mu)),
      se = e.map((a) => a.map((a) => Math.pow(a, 2))),
      mse = mean(se),
      sigma = mse.map(Math.sqrt);
  return sigma;
}

// process a CSV formatted string into array of arrays of images and array of labels
function process(text, data) {
    var lines = text.split(/\r\n|\n/);
    var images = [];
    var labels = [];
    // iterate through lines
    for (var i = 0; i < lines.length - 1; i++) {
      var digits = lines[i].split(',');
      labels.push(parseInt(digits[0]));
      var image = [];
      for (var j=1; j < digits.length; j++) {
        image.push(parseFloat(digits[j]) / 255.0);
      }
      images.push(image);
    }
    // save data
    data["images"] = images;
    data["labels"] =  labels;
    data['size'] =  i;
    // data['mean'] =  mean(images);
    // data['std'] =  std(images, data['mean']);
}
