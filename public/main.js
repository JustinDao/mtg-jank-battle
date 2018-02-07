$(document).ready(function() {
    function hideTableRows() {
        console.log("hideTableRows")
        $("#mainboard-row").hide();
        $("#sideboard-row").hide();
        $("#total-row").hide();
        $("#time-row").hide();
    }

    function showTableRows() {
        console.log("showTableRows")
        $("#mainboard-row").show();
        $("#sideboard-row").show();
        $("#total-row").show();
        $("#time-row").show();
    }

    function resetTables() {
        console.log("resetTables")
        $("#mainboard-table-body").html("");
        $("#sideboard-table-body").html("")
        $("#total-amount").text("");
        $("#time-display").text("");
    }

    function formatPrice(price) {
        if (price != null)
        {
            return `$${price.toFixed(2)}`
        }

            return price;
    }

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
                hideTableRows();
                 $("#loader-row").show();
            }
        })
        .done(function( data ) {
            console.log("success!");
            $("#loader-row").hide();
            resetTables();

            var obj = JSON.parse(data);

            // Populate Time
            $("#time-display").text(new Date());

            // Populate Total
            var total = obj["total"];
            $("#total-amount").text(formatPrice(total));

            // Populate mainboard
            var mainboard = obj["mainboard"];
            mainboard.forEach(function(item) {
                var name = item["name"];
                var price = item["price"];
                var count = item["count"];
                var total = price * count;

                $("#mainboard-table-body").append(`<tr><td>${count}</td><td>${name}</td><td>${formatPrice(price)}</td><td>${formatPrice(total)}</td></tr>`)
            });

            // Populate sideboard
            var sideboard = obj["sideboard"];
            sideboard.forEach(function(item) {
                var name = item["name"];
                var price = item["price"];
                var count = item["count"];
                var total = price * count;

                $("#sideboard-table-body").append(`<tr><td>${count}</td><td>${name}</td><td>${formatPrice(price)}</td><td>${formatPrice(total)}</td></tr>`)
            });

            showTableRows();
        })
        .fail(function( err ) {
            console.log(err);
            console.log("error");
            $("#loader-row").hide();
        });
    });
});
