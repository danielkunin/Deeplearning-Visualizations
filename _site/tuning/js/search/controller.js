class controller {

  // constructor
  constructor() {

    this.experiments = [];

  }

  sample(n, mode, lrate_rng, bsize_rng) {
    // Reset
    this.experiments = [];
    // Grid Sample
    if (mode == "grid") {
      var s = Math.sqrt(n),
          w = Math.floor(s),
          h = Math.ceil(n / w);
      for (var i = 0; i < n; i++) {
        var lrate = (i % w + 1) / (w + 1) * (lrate_rng[1] - lrate_rng[0]) + lrate_rng[0],
            bsize = (Math.floor(i / w) + 1) / (h + 1) * (bsize_rng[1] - bsize_rng[0]) + bsize_rng[0];
        this.experiments.push(new experiment(lrate, bsize));
      }
    }
    // Random Sample
    if (mode == "random") {
      for (var i = 0; i < n; i++) {
        var lrate = Math.random() * (lrate_rng[1] - lrate_rng[0]) + lrate_rng[0],
            bsize = Math.random() * (bsize_rng[1] - bsize_rng[0]) + bsize_rng[0];
        this.experiments.push(new experiment(lrate, bsize));
      }
    }
  }

}
