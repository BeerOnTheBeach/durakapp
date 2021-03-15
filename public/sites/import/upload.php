<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Import CSV</title>
    <link href="../../src/assets/lib/bootstrap/css/bootstrap.css" rel="stylesheet"/>
    <link href="../../src/assets/common/css/import.css" rel="stylesheet"/>
    <script src="../../src/assets/lib/bootstrap/js/bootstrap.bundle.js"></script>
</head>
<body>
<div class="container">
    <div class="row">
        <form action="import.php" method="post" enctype="multipart/form-data">
            <label class="form-label" for="csv">CSV hochladen</label>
            <input type="file" class="form-control" id="csv" name="durak_csv"/>
            <button type="submit" class="btn btn-success form-control">CSV importieren</button>
        </form>
    </div>
</div>
</body>
</html>

