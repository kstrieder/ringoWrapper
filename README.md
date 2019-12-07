# ringoWrapper
A boilerplate template and script structure to build and maintain projects using the ringojs web application framework.

https://ringojs.org/ is pretty cool web application server, with a unique combination of speed, versatility and java integration.

When I wanted to get started, I found it not too obvious to get my first http request answered and there was a fair
amount of boilerplate to create to make it smooth.

With ringoWrapper I'm sharing my boilerplate and I set up a simple 1-2-3way to get ringojs booted up to your first
http-server.

## Getting started 1-2-3

### 1 update your build with external dependencies

I opted for a clean directory structure.

I also think that dependend submodule (in the git sense) should be kept isolated and untainted within your own
repository.

To update all git submodules use this command:
```
scripts/update_build submodules
```

As ringojs itself needs to be built before it can be used (with dependencies to `ant` and `ivy`), use this
command to build ringojs first:
```
scripts/update_build ringo
```

To check if everything built correctly, you can start up ringojs internal test suite:
```
scripts/update_build ringotest
```

In my projects, I sometimes use ReactJS. The `update_build` script is prepared to also run a React build - but I guess
you'll want to check for the hook and add some stuff yourself. So no further explanation here.

Of course, you can run all commands combined:
```
scripts/update_build submodules ringo ringotest
```

### 2 configuration

Some configuration is needed, path information (like where is java), tcp stuff (ip to bind to, port number) and so on.

There a two (if you run dev and prod environments even more) config files, you should check.

I separate configuration in generic and host specific aspects.

Generic configuration is kept here: `baseConfiguration`
Edit this file for everything that will be identical for all your dev/prod/test environments. Such as path information
(to find your suitable java, I use a list of directories where the configuration will look for java) and so on.

Host specific configuration is to be put into a config file name `baseConfiguration.<HOSTNAME>`
Replace <HOSTNAME> with your local hostname (output of the hostname command).

With that approach, you can keep all host specific configuration in your git repository and maintain them alongside,
but on each host only the specific file is sourced.

I put ip and port configuration in the host specific configuration file.

However, each config file can define each and every parameter. If a parameter is defined in the generic and host
specific part, the host specific information will replace the generic information.

You can make use of all defined `export` variable in the config files, in so called `.template` files.

For all files that are found in this directory structure, that match the filename `*.template`, this file will be read
and for each occurence of $<VARIABLE-NAME> this string will be replaced with the defined `export` in your configuration.

You should put all generated configuration in your `.gitignore` (like `app/config.js` which is generated from its
corresponding template).

After defining all your configures, try a run:
```
scripts/configure
```
The output of this script will inform you, if everythin is found and which `.template` files haven been found.

## 3 Run 

Now, if you want to run what you built, start up the ringojs server.
The initial clone will include a very simple ringojs app, that will provide the URL /test and output Date.now().

Running the ringojs server will also include the start of `configure`.
So it is guaranteed that your build will also use the provided configuration.

As it is done automatically, there's no penalty. However, it will make sure, that
your process is repeatable and reliable.

### Run with console bindings:
```
scripts/launcher
```
ringojs will start and be bound to your console. That makes it easy to stop (hit CTRL-C) and simple to find your
error output on the console.

### Run as a daemon
```
scripts/launcher daemon [stop]
```
If you want to start your ringojs in the background, just start is as a daemon and you'll find the console output
in the `log/` directory.

### Execute ringo directly (e.g. ringo-admin)
```
scripts/rexec ringo-admin
```

The helper script `rexec` will execute any executable file or script found in `ringojs/bin` and 
pass over remaining comand line parameters.

It will set all environment variables and declarations as defined in the configurations.


#### 4 A simple performance test with curl
I prepared a very simple http-get test script, that will a number of requests against a list of defined URIs.
```
scripts/test_get
```
The script will measure your request performance and provide you with information about average, median, max and min
milliseconds for your requests.

## The directory structure
### `app/`
This is where I think your own ringojs app should go.

`app/main.js` is the actual code for a simple app that does nothing more
than to define some requirements and configure the /test url.

### `app/libs/`
I put links to referenced submodules here. This ensures, that I don't
need to taint them and use symbolic links to put them in my project.

### `libs/`
I put added submodules in this directory, with the excempt of ringojs itself
as this shall be pretty fundamental to this whole project.

### `log/`
When ringojs is started in daemon mode, logfile output will be put here.

### `ringojs/`
ringojs as a submodule

### `scripts/`
My helper scripts - the main part of this project.


# Example Application in `main.js`

A super simple dynamic web server based on Mustache templating is provided as an example in `app/main.js`.
It uses configuration based handler code, index.html and a page handler.
