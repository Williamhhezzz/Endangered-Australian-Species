const activeViews = [];

const registerView = (res) => {
  if (res && res.view) {
    activeViews.push(res.view);
  }
  return res;
};

const embedSpec = (elementId, specPath) => {
  return vegaEmbed(elementId, specPath, { 
    renderer: "svg", 
    actions: false 
  })
  .then(registerView)
  .catch(console.error);
};

// 1. Standalone Visualizations
embedSpec("#vis-c1", "charts/c1_indexline_streamgraph.vg.json");
embedSpec("#vis-c4", "charts/c4_heatmap.vg.json");
embedSpec("#vis-c5", "charts/c5_stacked_bar.vg.json");
embedSpec("#vis-c6", "charts/c6_bar_threat_pressures.vg.json");
embedSpec("#vis-c7", "charts/c7_lollipop_invasive_species.vg.json");
embedSpec("#vis-c8", "charts/c8_bar_habitat_loss.vg.json");
embedSpec("#vis-c9", "charts/c9_multiline.vg.json");
embedSpec("#vis-c10", "charts/c10_stacked_bar_priority_coverage.vg.json");

// 2. Coordinated Group Link: C2 (Waffle) <-> C3 (Dumbbell)
Promise.all([
  vegaEmbed("#vis-c2", "charts/c2_waffle_chart.vg.json", { renderer: "svg", actions: false }).then(registerView),
  vegaEmbed("#vis-c3", "charts/c3_group_dumbbell.vg.json", { renderer: "svg", actions: false }).then(registerView)
]).then(([resC2, resC3]) => {
  const viewC2 = resC2.view;
  const viewC3 = resC3.view;

  let currentSelectedClass = null;

  viewC2.addEventListener("click", (event, item) => {
    if (item && item.datum && item.datum.class) {
      currentSelectedClass = (currentSelectedClass === item.datum.class) ? null : item.datum.class;
    } else {
      currentSelectedClass = null;
    }
    viewC2.signal("highlight_class", currentSelectedClass).runAsync();
    viewC3.signal("highlight_class", currentSelectedClass).runAsync();
  });
}).catch(console.error);

// 3. Coordinated Spatial Display: M1 (Choropleth) <-> M2 (Symbol) <-> M3 (Dot Density)
Promise.all([
  vegaEmbed("#vis-m1", "charts/m1_choropleth_map.vg.json", { renderer: "svg", actions: false }).then(registerView),
  vegaEmbed("#vis-m2", "charts/m2_symbol_map.vg.json", { renderer: "svg", actions: false }).then(registerView),
  vegaEmbed("#vis-m3", "charts/m3_dot_map.vg.json", { renderer: "svg", actions: false }).then(registerView)
]).then(([resM1, resM2, resM3]) => {
  const mapViews = [resM1.view, resM2.view, resM3.view];
  let currentActiveState = null;

  const setSpatialHighlight = (targetState) => {
    currentActiveState = targetState;
    mapViews.forEach((v) => {
      v.signal("highlight_state", currentActiveState).runAsync();
    });
  };

  // Resolves state identifier across polygon properties and point datums
  const extractState = (item) => {
    if (!item || !item.datum) return null;
    return item.datum.state_name || 
           item.datum.State || 
           (item.datum.properties && item.datum.properties.name) || 
           null;
  };

  mapViews.forEach((view) => {
    view.addEventListener("click", (event, item) => {
      const clickedState = extractState(item);

      if (clickedState) {
        // Toggle selection off if clicking the active state again
        const nextState = (currentActiveState === clickedState) ? null : clickedState;
        setSpatialHighlight(nextState);
      } else {
        // Clicking ocean or background clears selection across all maps
        setSpatialHighlight(null);
      }
    });
  });
}).catch(console.error);

// 4. Global Responsive Resize Handler
let resizeTimer = null;
const handleGlobalResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    activeViews.forEach((v) => {
      try {
        if (v && typeof v.resize === "function") {
          v.resize().runAsync();
        }
      } catch (err) {
        console.warn("Resize warning:", err);
      }
    });
  }, 120);
};

window.addEventListener("resize", handleGlobalResize);

if (typeof ResizeObserver !== "undefined") {
  const observer = new ResizeObserver(() => {
    handleGlobalResize();
  });
  const container = document.querySelector(".container");
  if (container) {
    observer.observe(container);
  }
}