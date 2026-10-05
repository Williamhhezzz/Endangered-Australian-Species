const embedSpec = (elementId, specPath) => {
  vegaEmbed(elementId, specPath, { actions: false })
    .then((result) => {
    })
    .catch(console.error);
};


embedSpec("#vis-c1", "charts/c1_national_trend.vg.json");