require 'sinatra'
require "net/http"
require "net/https"
require "uri"
require 'nokogiri'
require 'json'

ignore_sets = [
  "Unstable",
  "Unhinged",
  "Unglued"
]

get '/' do
  erb :index
end

get '/test' do 
  5
end

post '/calculate' do
  request.body.rewind

  input = request.body.read
  request_payload = JSON.parse(input)

  mainboard_price = 0.0
  sideboard_price = 0.0

  mainboard_cards = []
  sideboard_cards = []
  
  url = URI.parse("https://www.cardkingdom.com")
  req = Net::HTTP.new(url.host, url.port)
  req.use_ssl = true
  req.verify_mode = OpenSSL::SSL::VERIFY_NONE

  if request_payload.key?("mainboard") && request_payload.key?("mainboard") != nil
    request_payload["mainboard"].each do |line|
      parts = line.strip.split
      num = parts[0].to_i
      card = parts[1..-1].join(" ")
      url_card_name = card.gsub(" ", "%20")

      puts card

      response = req.get("/catalog/search?filter%5Bipp%5D=20&filter%5Bsort%5D=price_asc&filter%5Bname%5D=%22#{url_card_name}%22")
      page = Nokogiri::HTML(response.body)

      min_price = page.css("div.productCardWrapper")
        .select{ |c| !c.css("span.productDetailTitle").text.include?("Not Tournament Legal") }
        .select{ |c| ignore_sets.all?{|set| !c.css("div.productDetailSet").text.include?(set)} }
        .flat_map{ |obj| obj.css("li.NM").css("span.stylePrice").map{ |p| p.text.strip.gsub("$", "").to_f } }.min

      if min_price != nil
        mainboard_cards << ({name: card, price: min_price, count: num})

        mainboard_price += min_price * num
      else
        mainboard_cards << ({name: card, price: nil, count: num})
      end
    end
  end

  if request_payload.key?("sideboard") && request_payload.key?("sideboard") != nil
    request_payload["sideboard"].each do |line|
      parts = line.strip.split
      num = parts[0].to_i
      card = parts[1..-1].join(" ")
      url_card_name = card.gsub(" ", "%20")

      puts card

      response = req.get("/catalog/search?filter%5Bipp%5D=20&filter%5Bsort%5D=price_asc&filter%5Bname%5D=%22#{url_card_name}%22")
      page = Nokogiri::HTML(response.body)

      min_price = page.css("div.productCardWrapper")
        .select{ |c| !c.css("span.productDetailTitle").text.include?("Not Tournament Legal") }
        .select{ |c| ignore_sets.all?{|set| !c.css("div.productDetailSet").text.include?(set)} }
        .flat_map{ |obj| obj.css("li.NM").css("span.stylePrice").map{ |p| p.text.strip.gsub("$", "").to_f } }.min

      if min_price != nil
        sideboard_cards << ({name: card, price: min_price, count: num})

        sideboard_price += min_price * num
      else
        sideboard_cards << ({name: card, price: nil, count: num})
      end
    end
  end

  total_price = (mainboard_price + sideboard_price).round(2)
  p total_price


  content_type :json
  { total: total_price, mainboard: mainboard_cards, sideboard: sideboard_cards }.to_json
end
