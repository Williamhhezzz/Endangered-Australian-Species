const embedSpec = (elementId, specPath) => {
  vegaEmbed(elementId, specPath, { actions: false })
    .then((result) => {
    })
    .catch(console.error);
};


embedSpec("#vis-c1", "charts/c1_national_trend.vg.json");
embedSpec("#vis-c2", "charts/c2_waffle_chart.vg.json");
embedSpec("#vis-c3", "charts/c3_group_dumbbell.vg.json");
embedSpec("#vis-m1", "charts/m1_choropleth_map.vg.json");
embedSpec("#vis-m2", "charts/m2_symbol_map.vg.json");
embedSpec("#vis-m3", "charts/m3_dot_map.vg.json");
embedSpec("#vis-c4", "charts/c4_heatmap.vg.json");