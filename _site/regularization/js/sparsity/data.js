
// Set directory of zip reader
zip.workerScriptsPath = window.location.pathname.slice(0, -10) + "/js/sparsity/zip/";

// Download the .zip file, Extract the .csv file, Load into RAM
function extract(file, data) {//, draw) {
  zip.createReader(new zip.HttpReader(file), function(reader) {

    reader.getEntries(function(entries) {

      entries[0].getData(new zip.TextWriter(), function(text) {
        
        process(text, data);

        reader.close(function() {
          // onclose callback
    			d3.select("#mnist_load").classed("inactive", true)
    			d3.select("#mnist_start").classed("inactive", false)
    			d3.select("#mnist_step").classed("inactive", false)
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

// process a CSV formatted string into array of arrays of images and array of labels
function process(text, data) {
    var lines = text.split(/\r\n|\n/);
    var images = [];
    var labels = [];
    // iterate through lines
    for (var i = 0; i < lines.length - 1; i++) {
      var digits = lines[i].split(',');
      labels.push(parseFloat(digits[0]));
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
}
