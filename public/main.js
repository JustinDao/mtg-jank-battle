$(document).ready(function() {
    // Cards is a list of tuples
    // { name, num, type }
    function UpdatePrices(cards) {
        var completed = 0;
        var total = 0;

        cards.forEach(function(card) {
            var name = card["name"];
            var number = card["number"];
            var type = card["type"];

            var input = {
                "name": name,
                "number": number
            }

            $.ajax({
                method: "POST",
                url: "/calculateSingle",
                data: JSON.stringify(input),
                contentType: "application/json",
                dataType: "text"
            })
            .always(function() {
                completed += 1;
                if (completed == cards.length)
                {
                    $("#time-display").text(new Date());
                    $("#loader-row").hide();
                }
            })
            .done(function (data) {                
                var obj = JSON.parse(data);
                price = obj["price"];
                card_total = obj["total"];

                if (card_total != null)
                {
                    total += parseFloat(card_total);    
                    $("#total-amount").text(formatPrice(total));
                }                

                if (type == "mainboard")
                {
                    $("#mainboard-table-body").append(`<tr><td>${number}</td><td>${name}</td><td>${formatPrice(price)}</td><td>${formatPrice(card_total)}</td></tr>`);
                }
                else if (type == "sideboard")
                {
                    $("#sideboard-table-body").append(`<tr><td>${number}</td><td>${name}</td><td>${formatPrice(price)}</td><td>${formatPrice(card_total)}</td></tr>`);    
                }            
            });
        });
    }

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
        var mainboard = mainboardStr.split("\n");
        mainboard = mainboard.filter(str => str != null && str.trim() != "");
        console.log(mainboard);

        var sideboardStr = $("#sideboard").val();
        var sideboard = sideboardStr.split("\n");
        sideboard = sideboard.filter(str => str != null && str.trim() != "");
        console.log(sideboard);

        // get data
        var cardData = {};
        if (mainboard.length > 0)
        {
            cardData["mainboard"] = mainboard;
        }

        if (sideboard.length > 0)
        {
            cardData["sideboard"] = sideboard;
        }

        hideTableRows();
        $("#loader-row").show();
        resetTables();

        var total = 0.0;

        var completed = 0;
        var sideCompleted = 0;

        showTableRows();

        var cards = [];        

        mainboard.forEach(function(str) {
            var parts = str.split(" ");
            var number = parts.shift();
            var name = parts.join(" ");

            cards.push({
                "name": name,
                "number": number,
                "type": "mainboard",
            });
        });

        sideboard.forEach(function(str) {
            var parts = str.split(" ");
            var number = parts.shift();
            var name = parts.join(" ");

            cards.push({
                "name": name,
                "number": number,
                "type": "sideboard",
            });
        });

        UpdatePrices(cards);
    });
});