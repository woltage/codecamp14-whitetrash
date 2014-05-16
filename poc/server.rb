require 'sinatra'

get '/location' do
    File.read(File.join('location.html'))
end
