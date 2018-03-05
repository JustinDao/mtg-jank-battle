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

# WUBRG
basic_lands = [
  "Plains",
  "Island",
  "Swamp",
  "Mountain",
  "Forest"
]

get '/' do
  erb :index
end

get '/test' do 
  5
end

# input: { name: <str>, num: <int> }
post '/calculateSingle' do
  request.body.rewind

  input = request.body.read
  request_payload = JSON.parse(input)

  url = URI.parse("https://www.cardkingdom.com")
  req = Net::HTTP.new(url.host, url.port)
  req.use_ssl = true
  req.verify_mode = OpenSSL::SSL::VERIFY_NONE

  
  card = request_payload["name"].downcase
  num = request_payload["number"].to_i
  # puts card

  if card.strip == "" || num == 0
    return { price: 0, total: 0 }.to_json
  end

  url_card_name = card.gsub(" ", "%20")

  response = req.get("/catalog/search?filter%5Bipp%5D=20&filter%5Bsort%5D=price_asc&filter%5Bname%5D=%22#{url_card_name}%22")
  page = Nokogiri::HTML(response.body)

  min_price = page.css("div.productCardWrapper")
    .select{ |c| basic_lands.include?(card) ? c.css("span.productDetailTitle").text.downcase.include?(card) : c.css("span.productDetailTitle").text.downcase.strip == card }
    .select{ |c| ignore_sets.all?{|set| !c.css("div.productDetailSet").text.include?(set)} }
    .flat_map{ |obj| obj.css("li.NM").css("span.stylePrice").map{ |p| p.text.strip.gsub("$", "").to_f } }.min

  # puts min_price

  if min_price != nil
    return { price: min_price, total: min_price * num }.to_json
  else
    # puts "#{num} #{card} failed."
    return { price: nil, total: nil }.to_json
  end
end
