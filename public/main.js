$(document).ready(function() {
    $("#calculate").click(function() {
        var mainboardStr = $("#mainboard").val();
        var mainboard = mainboardStr.split("\n")
        console.log(mainboard);

        var sideboardStr = $("#sideboard").val();
        var sideboard = sideboardStr.split("\n");
        console.log(sideboard);

        // get data
        var cardData = {
            "mainboard": mainboard,
            "sideboard": sideboard
        };

        $.ajax({
            method: "POST",
            url: "/calculate",
            data: JSON.stringify(cardData),
            contentType: "application/json",
            dataType: "text",
            beforeSend: function() {
                 $("#loader-row").show();
            }
        })
        .done(function( data ) {
            console.log("success!");

            $("#loader-row").hide();            

            var obj = JSON.parse(data);
            var total = obj["total"];
            $("#total-display").text($("#total-display").text() + total);

            var mainboard = obj["mainboard"];
            mainboard.forEach(function(item) {
                var name = item["name"];
                var price = item["price"];
                var count = item["count"];
                var total = price * count;

                $("#card-table-body").append(`<tr><td>${count}</td><td>${name}</td><td>${price}</td><td>${total}</td></tr>`)
            });

            var sideboard = obj["sideboard"];
            sideboard.forEach(function(item) {
                var name = item["name"];
                var price = item["price"];
                var count = item["count"];
                var total = price * count;

                $("#side-table-body").append(`<tr><td>${count}</td><td>${name}</td><td>${price}</td><td>${total}</td></tr>`)
            });

            $("#side-table").show();
            $("#card-table").show();
        })
        .fail(function( err ) {
            console.log(err);
            console.log("error");  
            $("#loader-row").hide();  
        });
    });
});