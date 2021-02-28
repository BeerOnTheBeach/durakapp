<!doctype html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Durak App</title>

    <link href="/public/src/assets/lib/bootstrap/css/bootstrap.css" rel="stylesheet"/>
    <script src="/public/src/assets/lib/bootstrap/js/bootstrap.bundle.js"></script>
    <script src="/public/src/assets/lib/vue/vue.js"></script>
    <script src="/public/src/assets/lib/vue/axois.js"></script>
</head>
<body>

<script>
    let url = ''
    axios.get('/api/player/read.php')
        .then(response => {
            console.log(response.data);
        })
        .catch(error => console.error(error) );

</script>



<script src="/public/src/main.js"></script>
</body>
</html>