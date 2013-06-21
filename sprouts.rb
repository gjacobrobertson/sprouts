require 'sinatra/base'

class Sprouts < Sinatra::Base
  set :static, true

  get '/' do
    erb :index
  end
end