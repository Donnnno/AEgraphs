function createBarChart() {
    app.beginUndoGroup("New Graph");

    var compName = "Bar Chart";
    var width = 1920;
    var height = 1080;
    var duration = 60;
    var framerate = 25;

    var newComp = app.project.items.addComp(compName, width, height, 1, duration, framerate);

    var shapeController = newComp.layers.addShape();
    shapeController.name = "Controller";

    shapeController.property("Transform").property("Position").setValue([348, 790]);

    shapeController.guideLayer = true;

    var contents = shapeController.property("ADBE Root Vectors Group");
    var rectGroup = contents.addProperty("ADBE Vector Group");
    rectGroup.name = "Null";

    var rectPath = rectGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
    rectPath.property("ADBE Vector Rect Size").setValue([100, 100]);

    var fill = rectGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
    fill.property("ADBE Vector Stroke Color").setValue([1, 0, 0]);

    var slider1 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider1.name = "Lijnen - Aantal";
    slider1.property("ADBE Slider Control-0001").setValue(5);

    var slider2 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider2.name = "Lijnen - Lengte";
    slider2.property("ADBE Slider Control-0001").setValue(1352);

    var slider3 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider3.name = "Lijnen - Hoogte";
    slider3.property("ADBE Slider Control-0001").setValue(512);

    var slider4 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider4.name = "Lijnen - Breedte";
    slider4.property("ADBE Slider Control-0001").setValue(100);

    var dropdown1 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Dropdown Control");
    dropdown1.name = "Y-As";
    dropdown1.property(1).setPropertyParameters(["Waarde", "Woorden"]);

    var slider5 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider5.name = "Y-As - Min waarde";
    slider5.property("ADBE Slider Control-0001").setValue(0);

    var slider6 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider6.name = "Y-As - Max waarde";
    slider6.property("ADBE Slider Control-0001").setValue(1000);

    var slider7 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider7.name = "Y-As - Decimalen";
    slider7.property("ADBE Slider Control-0001").setValue(0);

    var dropdown2 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Dropdown Control");
    dropdown2.name = "Y-As weergave";
    var menuProperty2 = dropdown2.property(1);
    menuProperty2.setPropertyParameters(["Leeg", "Prefix", "Suffix"]);

    var dropdown3 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Dropdown Control");
    dropdown3.name = "X-As";
    var menuProperty3 = dropdown3.property(1);
    menuProperty3.setPropertyParameters(["Waarde", "Woorden"]);

    var slider8 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider8.name = "X-As - Startgetal";
    slider8.property("ADBE Slider Control-0001").setValue(2000);

    var slider9 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider9.name = "X-As - Toename";
    slider9.property("ADBE Slider Control-0001").setValue(1);

    var slider10 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider10.name = "X-As - Stap overslaan na";
    slider10.property("ADBE Slider Control-0001").setValue(8);

    var slider11 = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    slider11.name = "X-As - Stap";
    slider11.property("ADBE Slider Control-0001").setValue(5);

    // Add sliderDistance property
    var sliderDistance = shapeController.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
    sliderDistance.name = "Balk Afstand";
    sliderDistance.property("ADBE Slider Control-0001").setValue(100);
    sliderDistance.property("ADBE Slider Control-0001").expression = "const l = value;\n\nsCount=0-1;\nsRegEx=\"Balk\";\nsSS = \"\";\n\nx=thisComp.numLayers;\n\nfor (sNum=1;sNum <= x;sNum++){  \n\tsLay=thisComp.layer(sNum); \n\tsReg=RegExp(sRegEx);  \n\t\n\tif (sLay.name.match(sReg))  \n\t\t{     \n\t\tsCount++;    \n\t\t}  \n\t};\n\ns = l/sCount;[s];";

    // Lijnen
    var shapeLijnen = newComp.layers.addShape();
    shapeLijnen.name = "Lijnen";
    shapeLijnen.parent = shapeController;

    var contents = shapeLijnen.property("ADBE Root Vectors Group");
    var groepHorizontaal = contents.addProperty("ADBE Vector Group");
    groepHorizontaal.name = "Horizontale lijnen";

    // Voeg lijn subgroep toe
    var groepLijn = groepHorizontaal.property("Contents").addProperty("ADBE Vector Group");
    groepLijn.name = "lijn";

    var path = groepLijn.property("Contents").addProperty("ADBE Vector Shape - Group");
    path.name = "Path 1";
    path.property("Path").expression = "l = thisComp.layer(\"Controller\").effect(\"Lijnen - Hoogte\")(\"Slider\");\ncreatePath(points = [[0,l], [0,0]], inTangents = [], outTangents = [], is_closed = false);";

    var stroke = groepLijn.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    stroke.property("ADBE Vector Stroke Width").setValue(2);
    stroke.property("ADBE Vector Stroke Color").setValue([255, 255, 255]);

    var repeater = groepHorizontaal.property("Contents").addProperty("ADBE Vector Filter - Repeater");
    repeater.property("Contents").addProperty("ADBE Vector Repeater Copies").setValue(9);

    var repeaterTransform = repeater.property("ADBE Vector Repeater Transform");
    var repeaterPos = repeaterTransform.property("ADBE Vector Repeater Transform Position");

    var posExpr = "c = content(\"Horizontale lijnen\").content(\"Repeater 1\").copies -1;\ncalc = thisComp.layer(\"Controller\").effect(\"Lijnen - Lengte\")(\"Slider\")/c;\n[calc, 0]";
    repeaterPos.expression = posExpr;




    app.endUndoGroup();

    newComp.openInViewer();
}
