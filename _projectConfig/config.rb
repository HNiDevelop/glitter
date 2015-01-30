# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "../"
css_dir = "../stylesheets"
sass_dir = "../sass"
images_dir = "../assets"
javascripts_dir = "../javascripts"

# You can select your preferred output style here (can be overridden via the command line):
output_style = :compact

# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false

# Make a copy of sprites with a name that has no uniqueness of the hash.
on_sprite_saved do |filename|
if File.exists?(filename)
newfilename = filename.gsub(%r{-s[a-z0-9]{10}\.png$}, '.png')
FileUtils.cp filename, newfilename
# Note: Compass outputs both with and without random hash images.
# To not keep the one with hash, add: (Thanks to RaphaelDDL for this)
if File.exists?(newfilename) 
  FileUtils.rm_rf(filename)
end
end
end

# Replace in stylesheets generated references to sprites
# by their counterparts without the hash uniqueness.
on_stylesheet_saved do |filename|
if File.exists?(filename)
css = File.read filename
File.open(filename, 'w+') do |f|
  f << css.gsub(%r{-s[a-z0-9]{10}\.png}, '.png')
end
end
end