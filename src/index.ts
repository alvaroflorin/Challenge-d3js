import * as d3 from "d3";
import * as topojson from "topojson-client";
const japanjson = require("./japan.json");
import { stats, statsUpdated, ResultEntry } from "./stats";
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./prefectures";

var colour = d3
  .scaleThreshold<number, string>()
  .domain([0,1,20,50,100,400,800,1900])
  .range([
    "#eeeeee",
    "#eeeec3",
    "#e8cd7e",
    "#ef9b30",
    "#f18e22",
    "#f48114",
    "#f67304",
    "#fb5000",
    "#ff0000"
  ]); 
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3.geoMercator()
  .precision(0.1)
  .center([138, 35])
  .rotate([0,0,20])
  .scale(1800)
  .translate([100 , 920 ]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(japanjson, japanjson.objects.japan);

document
.getElementById("current")
.addEventListener("click", function handleCurrent() {
  createSvg(statsUpdated);
});
document
.getElementById("initial")
.addEventListener("click", function handleInitial() {
  createSvg(stats);
});
const createSvg=(data:ResultEntry[])=>{
  
  const affectedRadiusScaleQuantile=d3
  .scaleLinear()
  .domain([0,1,20,50,100,400,800,1900])
  .range([0,3,5,7,9,11,13,15,17])


  const calculateRadiusBasedOnAffectedCases = (comunidad: string) => {
    const entry = data.find(item => item.name === comunidad);
  
    return entry ? affectedRadiusScaleQuantile(entry.value) : 0;
  };

  const assignRegionBackgroundColor = (name: string) => {
    const item = data.find(
      item => item.name === name
    );
  
    if (item) {
      console.log(item.value);
    }
    return item ? colour(item.value) : colour(0);
  };

    svg
    .selectAll("path")
    .data(geojson["features"])
    .enter()
    .append("path")
    .attr("class", "prefecture")
    .attr("fill",d=>assignRegionBackgroundColor(d["properties"]["region"]))
    .attr("d", geoPath as any)
    .merge(svg.selectAll("path") as any)
    .transition()
    .duration(500)
    .attr("fill",d=>assignRegionBackgroundColor(d["properties"]["region"]))
    ;

    const circles=svg
    .selectAll("circle");
    circles
    .data(latLongCommunities)
    .enter()
    .append("circle")
    .attr("class","affected-marker")
    .attr("r", d=>calculateRadiusBasedOnAffectedCases(d.name))
    .attr("cx",d=> aProjection([d.long,d.lat])[0])
    .attr("cy",d=> aProjection([d.long,d.lat])[1])
    .merge(circles as any)
    .transition()
    .duration(500)
    .attr("r", d=>calculateRadiusBasedOnAffectedCases(d.name))
    ;
};
createSvg(stats);


