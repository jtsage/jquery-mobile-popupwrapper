#!/usr/bin/python

from optparse import OptionParser
import subprocess as sp
import re
import os

usage = "usage: %prog [options]";
parser = OptionParser(usage=usage)
parser.add_option('-b', '--build', action="store", help="Set version to build", type="string", default="latest", dest="ver");
parser.add_option('-v', '--verbose', action="store_true", help="Verbose mode", dest="verbose", default=True);
parser.add_option('-q', '--quiet', action="store_false", help="Quiet mode", dest="verbose");

(options, args) = parser.parse_args();

javapath = sp.check_output(["which", "java"]);

infile = [
	'../js/jqm-popupwrap.js',
]
files = {}

slugtext = "/*\n * jQuery Mobile Framework : plugin to provide a popup wrapper.\n * Copyright (c) JTSage\n * CC 3.0 Attribution.  May be relicensed without permission/notification.\n * https://github.com/jtsage/jquery-mobile-popupwrapper\n */\n"

print 'jQM-PopupWrap Build Process'
print '-=-=-=-=-=-=-=-=-=-=-=-=-=-'
print 'Building Version: ' + options.ver

for ifile in infile:
	if ( options.verbose ):
		print ' - Reading File: ' + re.sub(r'../js/', '', ifile)
	key = 'a'
	f = open(ifile, 'r')
	uncomp = f.read();
	f.close();
	if ( options.verbose ): 
		print ' -- Compressing...'
	comp = sp.check_output(javapath.rstrip() + ' -jar ../external/yuicompressor-2.4.6.jar ' + ifile, shell=True);
	if ( options.verbose ): 
		print '  - In Size:  ' + str(len(uncomp)) + ' bytes'
		print '  - Out Size: ' + str(len(comp)) + ' bytes'
	files[key] = (uncomp,comp);
	
if not os.path.exists(options.ver):
	os.makedirs(options.ver)

if ( options.ver != 'latest' ):
	fprefix = 'jqm-popupwrap-'+options.ver+'.'
else :
	fprefix = 'jqm-popupwrap.'
		

for key in files:
	fname = fprefix+'js'
	fnamem = fprefix+'min.js'
		
	if ( options.verbose ):
		print ' - Writing File:' + fname
		print ' - Writing File:' + fnamem
	
	f = open('./'+options.ver+'/'+fname, 'w')
	f.write(files[key][0])
	f.close()
	f = open('./'+options.ver+'/'+fnamem, 'w')
	f.write(slugtext)
	f.write(files[key][1])
	f.close()




