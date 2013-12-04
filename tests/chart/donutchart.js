(function() {
    var dataviz = kendo.dataviz,
        Box2D = dataviz.Box2D,
        categoriesCount = dataviz.categoriesCount,
        chartBox = new Box2D(0, 0, 800, 600),
        plotArea,
        donutChart,
        firstSegment,
        TOLERANCE = 0.1,
        root,
        view;

    function setupDonutChart(plotArea, options) {
        view = new ViewStub();

        donutChart = new dataviz.DonutChart(plotArea, $.extend({}, { padding: 60 }, options));

        root = new dataviz.RootElement();
        root.append(donutChart);

        donutChart.reflow(chartBox);
        donutChart.getViewElements(view);

        firstSegment = donutChart.points[0];
    }

    (function() {
        var values = { type: "donut", data: [1, 2] },
            dataValues = {
               type: "donut",
               data: [{
                   value: 1,
                   category: "A",
                   explode: true
               }, {
                   value: 2,
                   category: "B"
               }]
            };

        function PlotAreaStub() { }

        $.extend(PlotAreaStub.prototype, {
            options: { }
        });

        // ------------------------------------------------------------
        module("Donut Chart / Array with values", {
            setup: function() {
                plotArea = new PlotAreaStub();
                setupDonutChart(plotArea, { series: [ values ] });
            }
        });

        test("creates points for donut chart data points", function() {
            equal(donutChart.points.length, values.data.length);
        });

        test("points have set angle", function() {
            $.each(donutChart.points, function() {
                ok(this.sector.angle);
            });
        });

        test("points have set startAngle", function() {
            $.each(donutChart.points, function() {
                ok(this.sector.angle);
            });
        });

        test("points have set owner", function() {
            ok(firstSegment.owner === donutChart);
        });

        test("sets segment category", function() {
            equal(firstSegment.category, "");
        });

        test("sets segment series", function() {
            ok(firstSegment.series === values);
        });

        test("sets segment series index", function() {
            ok(firstSegment.seriesIx === 0);
        });

        test("sets segment dataItem", function() {
            equal(typeof firstSegment.dataItem, "number");
        });

        // ------------------------------------------------------------
        module("Donut Chart / Array with items", {
            setup: function() {
                plotArea = new PlotAreaStub();
                setupDonutChart(plotArea, { series: [ dataValues ] });
            }
        });

        test("sets segment category", function() {
            equal(firstSegment.category, "A");
        });

        test("points have set owner", function() {
            ok(firstSegment.owner === donutChart);
        });

        test("sets segment series", function() {
            ok(firstSegment.series === dataValues);
        });

        test("sets segment series index", function() {
            ok(firstSegment.seriesIx === 0);
        });

        test("sets segment dataItem", function() {
            equal(typeof firstSegment.dataItem, "object");
        });

        test("sets segment dataItem", function() {
            close(firstSegment.percentage, 0.333, TOLERANCE);
        });

        test("sets segment explode", function() {
            ok(firstSegment.explode == true);
        });

        test("sets segment different center if segment have explode sets to true", function() {
            ok(firstSegment.sector.c != donutChart.points[1].sector.c);
        });
    })();


    (function() {
        var data = [{
                value: 10,
                explode: true,
                color: "red",
                category: "A"
            }, {
                value: 50,
                explode: false,
                color: "red",
                category: "B"
            }],
            chart,
            donutChart,
            firstSegment;

        // ------------------------------------------------------------
        module("Donut Chart / Data Source", {
            setup: function() {
                chart = createChart({
                    dataSource: {
                        data: data
                    },
                    series: [{
                        type: "donut",
                        field: "value",
                        categoryField: "category",
                        colorField: "color",
                        explodeField: "explode"
                    }]
                });

                donutChart = chart._plotArea.charts[0];
                firstSegment = donutChart.points[0];
            }
        });

        test("sets segment angle based on value", function() {
            equal(firstSegment.sector.angle, 60);
        });

        test("sets segment category from dataItem", function() {
            equal(firstSegment.category, "A");
        });

        test("sets segment color from dataItem", function() {
            equal(firstSegment.options.color, "red");
        });

        test("sets segment explode from dataItem", function() {
            ok(firstSegment.explode == true);
        });

    })();


    (function() {
        var point,
            box,
            label,
            root,
            ring,
            VALUE = 1,
            CATEGORY = "A",
            segment,
            view,
            SERIES_NAME = "series";

        function createSegment(options) {
            segment = new dataviz.DonutSegment(
                VALUE,
                new dataviz.Ring(new dataviz.Point2D(0,0), 20, 100, 90, 100),
                options
            );

            segment.dataItem = { value: VALUE };

            box = new Box2D(0, 0, 100, 100);
            segment.reflow(box);

            root = new dataviz.RootElement();
            root.append(segment);

            view = new ViewStub();
            segment.getViewElements(view);
            ring = view.log.ring[0];
        }

        // ------------------------------------------------------------
        module("Donut Segment", {
            setup: function() {
                createSegment();
            }
        });

        test("is discoverable", function() {
            ok(segment.modelId);
        });

        test("fills target box", function() {
            sameBox(segment.box, box);
        });

        test("sets segment border color", function() {
            createSegment({ border: { color: "red" } });
            equal(segment.options.border.color, "red");
        });

        test("sets donut border width", function() {
            createSegment({ border: { width: 4 } });
            equal(segment.options.border.width, 4);
        });

        test("tooltipAnchor is set distance from segment", function() {
            var anchor = segment.tooltipAnchor(10, 10);
            arrayClose([Math.round(anchor.x), Math.round(anchor.y)], [80, -77], TOLERANCE);
        });

        test("sets overlay radius", function() {
            equal(ring.style.overlay.r, segment.sector.r);
        });

        test("sets overlay inner radius", function() {
            equal(ring.style.overlay.ir, segment.sector.ir);
        });

        test("sets overlay cx", function() {
            equal(ring.style.overlay.cx, segment.sector.c.x);
        });

        test("sets overlay cy", function() {
            equal(ring.style.overlay.cy, segment.sector.c.y);
        });

        test("does not set overlay options when no overlay is defined", function() {
            createSegment({ overlay: null });
            ok(!ring.style.overlay);
        });

        test("highlightOverlay returns segment outline", function() {
            view = new ViewStub();

            segment.highlightOverlay(view);
            equal(view.log.ring.length, 1);
        });

        test("outline element has same model id", function() {
            view = new ViewStub();

            segment.highlightOverlay(view);
            equal(view.log.ring[0].style.data.modelId, segment.modelId);
        });

        test("ring has same model id", function() {
            equal(ring.style.data.modelId, segment.modelId);
        });

        test("label has same model id", function() {
            createSegment({ labels: { visible: true } });
            equal(segment.label.modelId, segment.modelId);
        });

    })();


    (function() {
        // ------------------------------------------------------------
        var chart,
            labelElement,
            segmentElement;

        function createDonutChart(options) {
            chart = createChart($.extend({
                series: [{
                    type: "donut",
                    data: [1],
                    labels: {
                        visible: true,
                        distance: 20
                    }
                }]
            }, options));

            var plotArea = chart._model.children[1],
                segment = plotArea.charts[0].points[0],
                label = segment.children[0];

            segmentElement = $(dataviz.getElement(segment.id));
            labelElement = $(dataviz.getElement(label.id));
        }

        module("Donut Chart / Events / seriesClick ", {
            setup: function() {
                createDonutChart({
                    seriesClick: function() { ok(true); }
                });
            },
            teardown: destroyChart
        });

        test("fires when clicking points", 1, function() {
            chart._userEvents.press(0, 0, segmentElement);
            chart._userEvents.end(0, 0);
        });

        test("fires when clicking labels", 1, function() {
            chart._userEvents.press(0, 0, labelElement);
            chart._userEvents.end(0, 0);
        });

        // ------------------------------------------------------------
        module("Donut Chart / Events / seriesHover", {
            setup: function() {
                createDonutChart({
                    seriesHover: function() { ok(true); }
                });
            },
            teardown: destroyChart
        });

        test("fires when clicking points", 1, function() {
            segmentElement.mouseover();
        });

        test("fires when clicking labels", 1, function() {
            labelElement.mouseover();
        });

    })();

    (function() {
        var points,
            chartBox = new Box2D(0,0,400,400),
            plotArea, donutChart;

        function PlotAreaStub() { }

        $.extend(PlotAreaStub.prototype, {
            options: { }
        });

        function createDonutChart(options) {
            view = new ViewStub();
            plotArea = new PlotAreaStub();

            donutChart = new dataviz.DonutChart(plotArea, $.extend({}, {
                series: [{
                    type: "donut",
                    data: [1, 1],
                    labels: {},
                    margin: 20,
                    holeSize: 40,
                    startAngle: 20
                }, {
                    type: "donut",
                    data: [1, 2],
                    labels: {},
                    margin: 20,
                    startAngle: 100
                }]}, options));

            donutChart.reflow(chartBox);
            donutChart.getViewElements(view);

            points = donutChart.points;
        }

        // ------------------------------------------------------------
        module("Donut Chart / Series / Configuration", {
            setup: function() {
                createDonutChart();
            }
        });

        test("first level points have margin", function() {
            var segment = points[points.length - 1],
                sector = segment.sector,
                size = sector.r - sector.ir;

            ok(size === 40);
        });

        test("first level points have holeSize", function() {
            $.each(points, function() {
                if (this.seriesIx == 0) {
                    ok(this.sector.ir == 40);
                }
            });
        });

        test("should apply start angle to all series", function() {
            ok(points[0].options.startAngle === 20 &&
               points[2].options.startAngle === 100);
        });

        test("points can be removed with visible false", function() {
            view = new ViewStub();
            plotArea = new PlotAreaStub();

            donutChart = new dataviz.DonutChart(plotArea, {
                series: [{
                    type: "donut",
                    data: [{
                        value: 100,
                        category: "Value A"
                    }, {
                        value: 200,
                        category: "Value B",
                        visible: false
                    }, {
                        value: 300,
                        category: "Value C",
                        visible: false
                    }]
                }]});

            donutChart.reflow(chartBox);
            donutChart.getViewElements(view);

            points = donutChart.points;

            equal(points.length, 1);
        });

        test("color fn argument contains value", 1, function() {
            createDonutChart({
                series: [{
                    type: "donut",
                    data: [1],
                    color: function(p) { equal(p.value, 1); }
                }]
            });
        });

        test("color fn argument contains percentage", 1, function() {
            createDonutChart({
                series: [{
                    type: "donut",
                    data: [1],
                    color: function(p) { equal(p.percentage, 1); }
                }]
            });
        });

        test("color fn argument contains dataItem", 1, function() {
            createDonutChart({
                series: [{
                    type: "donut",
                    data: [1],
                    color: function(p) {
                        deepEqual(p.dataItem, 1);
                    }
                }]
            });
        });

        test("color fn argument contains series", 1, function() {
            createDonutChart({
                series: [{
                    type: "donut",
                    data: [1],
                    name: "donutSeries",
                    color: function(p) { equal(p.series.name, "donutSeries"); }
                }]
            });
        });
    })();
})();
