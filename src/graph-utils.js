import defaultsDeep from "lodash/fp/defaultsDeep";
import {DataSet} from "vis-data/peer/esm/vis-data"
import {Network} from "vis-network/peer/esm/vis-network";
// import GraphEvents from "./graph-events";
const ColorHash = require('color-hash');


let colorHash = new ColorHash({hue: [{min: 90, max: 230}, {min: 90, max: 230}, {min: 90, max: 230}]});

function getColorForString(label) {
    return colorHash.hex(label);
}

export function LightenDarkenColor(col, amt) {

    let usePound = false;

    if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
    }

    let num = parseInt(col, 16);

    let r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;


    let g = ((num >> 8) & 0xff) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;


    let b = (num & 0xff) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16);

}

export default class VizNetworkUtils {

    networkOptions = {};

    defaultEdgeConfig = {
        smooth: {
            enabled: true,
            forceDirection: false,
            roundness: 0.6,
            type: "curvedCW"
        },
        physics: true,
        color: "#efefef",
        width: 0.75,
        arrows: {
            to: {
                enabled: true,
                scaleFactor: 1
            }
        }
    }
    //
    // defaultNodeConfig = {
    //     borderWidth: 1,
    //     borderWidthSelected: 1,
    //     shape: "circle",
    //     physics: true,
    //     size: 14,
    //     font: {
    //         size: 6,
    //         color: "white"
    //         // bold: true
    //     }
    // }
    //

    stabilizeGraph() {
        this.network.stabilize();
    }

    destroyGraph() {
        this.network.destroy();
    }


    // onClickEvent(properties) {
    //     const selection = properties.nodes
    //     var node_sel = nodes.get([selection])[0];
    //
    // }

    getDefaultOptions() {
        return {
            interaction: {hover: true},
            autoResize: true,
            layout: {
                hierarchical: false
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -26,
                    centralGravity: 0.005,
                    springLength: 130,
                    springConstant: 0.18,
                    avoidOverlap: 1.5
                },
                maxVelocity: 146,
                solver: 'forceAtlas2Based',
                timestep: 0.35,
                stabilization: {
                    enabled: true,
                    iterations: 0,
                    updateInterval: 25
                }
            },
            edges: this.generateEdgeConfig(),
            nodes: {
                borderWidth: 2,
                borderWidthSelected: 1,
                shape: "circle",
                // physics: true,
                size: 14,
                font: {
                    size: 6,
                    color: "white"
                    // bold: true
                },

            },
            // zoom: {
            //     scale: 1
            // },
            height: "calc(100vh - 300px)"
        };
    }

    getInitOptions() {
        return defaultsDeep(this.getDefaultOptions(), this.networkOptions);
    }


    initNetwork(container) {
        // merge user provided options with our default ones
        let options = this.getInitOptions();
        let _this = this;
        const {current} = container;
        this.network = new Network(
            current,
            {
                edges: this.edges,
                nodes: this.nodes
            },
            options
        );

        this.network.on("click", function (params) {
            _this.eventsListener(params);
            params.event = "[original event]";
            document.getElementById("eventSpan").innerHTML =
                "<h2>Click event:</h2>" + JSON.stringify(params, null, 4);
            console.log(
                "click event, getNodeAt returns: " +
                this.getNodeAt(params.pointer.DOM)
            );
        });
        this.network.on("dragStart", function (params) {
            // There's no point in displaying this event on screen, it gets immediately overwritten
            _this.eventsListener({});

            params.event = "[original event]";
            console.log("dragStart Event:", params);
            console.log(
                "dragStart event, getNodeAt returns: " +
                this.getNodeAt(params.pointer.DOM)
            );
        });
        this.network.on("dragging", function (params) {
            _this.eventsListener({});

            params.event = "[original event]";
            document.getElementById("eventSpan").innerHTML =
                "<h2>dragging event:</h2>" + JSON.stringify(params, null, 4);
        });
        this.network.on("dragEnd", function (params) {
            _this.eventsListener({});

            params.event = "[original event]";

            document.getElementById("eventSpan").innerHTML =
                "<h2>dragEnd event:</h2>" + JSON.stringify(params, null, 4);
            console.log("dragEnd Event:", params);
            console.log(
                "dragEnd event, getNodeAt returns: " +
                this.getNodeAt(params.pointer.DOM)
            );
        });

        this.network.on("selectNode", function (params) {
            _this.eventsListener(params);
            console.log("selectNode Event:", params);
            params.event.preventDefault();
            // $(".custom-menu").finish().toggle(100);
            // $(".custom-menu").css({
            //     top: params.event.pageY + "px",
            //     left: params.event.pageX + "px"
            // });
        });
        this.network.on("hoverNode", function (params) {
            console.log("hoverNode Event:", params);
            _this.eventsListener(params);

        });
        this.network.on("hoverEdge", function (params) {
            console.log("hoverEdge Event:", params);
            _this.eventsListener(params);

        });
        this.network.on("controlNodeDragging", function (params) {
            _this.eventsListener({});

            params.event = "[original event]";

            document.getElementById("eventSpan").innerHTML =
                "<h2>dragEnd event:</h2>" + JSON.stringify(params, null, 4);
            console.log("dragEnd Event:", params);
            console.log(
                "controlNodeDragging event, getNodeAt returns: " +
                this.getNodeAt(params.pointer.DOM)
            );
        });
        this.network.on('zoom', function (params) {
            _this.eventsListener(params);
        })
        this.network.on("stabilizationIterationsDone", function () {
            _this.network.setOptions({physics: false});
        });
    }

    generateEdgeConfig(groupName, edgeShape) {
        return this.defaultEdgeConfig;
    }

    getNodeColor(groupName) {
        const groupColor = getColorForString(groupName);
        return {
            border: LightenDarkenColor(groupColor, 50),
            background: groupColor,
            highlight: {
                border: groupColor,
                background: groupColor
            },
            hover: {
                border: groupColor,
                background: groupColor
            }
        };
    }

    stringify(value) {
        return value.toString();
    }

    getLabelFromKey(vertexData, labelPropertyKey) {
        let label = labelPropertyKey
            ? this.stringify(vertexData.properties[labelPropertyKey])
            : this.stringify(vertexData.id);
        if (!label) {
            label = vertexData.id;
        }
        return label;
    }

    _prepareNode(vertexData, labelPropertyKey) {
        const groupName = vertexData.label;
        vertexData.label = this.getLabelFromKey(vertexData, labelPropertyKey);
        vertexData.group = groupName;
        vertexData.color = this.getNodeColor(groupName);
        // this.generateNodeGroups(groupName);
        return vertexData;
    }

    _prepareEdge(edgeData, labelPropertyKey) {
        const groupName = edgeData.label;
        edgeData.label = labelPropertyKey
            ? this.stringify(edgeData.properties[labelPropertyKey])
            : this.stringify(edgeData.id);
        edgeData.group = groupName;
        // this.generatorEdgeGroups(groupName);
        return edgeData;
    }

    checkIfNodeExist(node) {
        return this.network.findNode(node.id).length !== 0;
    }

    checkIfEdgeExist(edge) {
        return !!this.edges.get(edge.id);
    }

    updateData(nodes, edges) {
        let nodesPrepared = [];
        let edgesPrepared = [];
        if (nodes) {
            nodes.forEach((node) => {
                const nodePrepared = this._prepareNode(node);
                if (!this.checkIfNodeExist(nodePrepared)) {
                    nodesPrepared.push(nodePrepared);
                }
            });
        }
        if (edges) {
            edges.forEach((edge) => {
                const edgePrepared = this._prepareEdge(edge);
                if (!this.checkIfEdgeExist(edgePrepared)) {
                    edgesPrepared.push(edgePrepared);
                }
            });
        }
        console.log("=====nodesPrepared", nodesPrepared);

        if (nodesPrepared.length > 0) {
            this.nodes.add(nodesPrepared);
        }
        if (edgesPrepared.length > 0) {
            this.edges.add(edgesPrepared);
        }
    }


    constructor(networkOptions, container, eventsListener) {
        this.networkOptions = networkOptions;
        this.eventsListener = eventsListener;
        this.edges = new DataSet([]);
        this.nodes = new DataSet([]);
        // this.events = GraphEvents()
        this.initNetwork(container);
        // this.isLoaded = true;
    }
}
