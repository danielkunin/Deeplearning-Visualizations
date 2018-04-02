
// create data object
var DATA;

// Set directory of zip reader
zip.workerScriptsPath = "/js/data/";

// Download the .zip file, Extract the .csv file, Load into RAM
function extract(file) {
  zip.createReader(new zip.HttpReader(file), function(reader) {

    reader.getEntries(function(entries) {

      entries[0].getData(new zip.TextWriter(), function(text) {
        
        process(text);

        reader.close(function() {
          // onclose callback
          console.log('finished loading ' + file);
        });
      }, function(current, total) {
        // onprogress callback
      });
    }
    );
  }, function(error) {
    // onerror callback
    console.log('error loading ' + file);
  });
}

// process a CSV formatted string into array of arrays of images and array of labels
function process(text) {
    var lines = text.split(/\r\n|\n/);
    var images = [];
    var labels = [];
    // iterate through lines
    for (var i = 0; i < lines.length - 1; i++) {
      var data = lines[i].split(',');
      labels.push(parseFloat(data[0]));
      var image = [];
      for (var j=1; j < data.length; j++) {
        image.push(parseFloat(data[j]) / 255.0);
      }
      images.push(image);
    }
    // save data
    DATA = { "images": images, "labels": labels, 'size': i};
}



