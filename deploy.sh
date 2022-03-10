#!/bin/bash


destination="b-schwertfeger.de@ssh.strato.de:/b-schwertfeger.de/public/projects/awi-work/GrowthModel"
scp *.html *.css *.js $destination
scp -r data $destination