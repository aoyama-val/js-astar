class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  isEqual(anotherPos) {
    return this.x == anotherPos.x && this.y == anotherPos.y;
  }
}

class Node {
  constructor(position, canEnter) {
    this.position = position;
    this.canEnter = canEnter;
    this.state = 'None';  // None or Open or Closed
    this.cost = null;
    this.estimateCost = null;
    this.score = null;
    this.parentNode = null;
  }
}

class Map {
  constructor(nodes, startPos, goalPos) {
    this.nodes = nodes;
    this.startPos = startPos;
    this.goalPos = goalPos;
    this.openList = [];
    this.done = false;
    this.route = [];
    this.stepCount = 0;

    // スタート地点を最初の基準点とする
    this.head = this.getNodeByPosition(this.startPos);
    this.head.cost = 0;
    this.calcEstimateCost(this.head);
  }

  getNodeByPosition(pos) {
    for (var i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].position.isEqual(pos)) {
        return this.nodes[i];
      }
    }
    return null;
  }

  canEnter(pos) {
    var node = this.getNodeByPosition(pos);
    if (node) {
      return node.canEnter;
    } else {
      throw "Invalid position";
    }
  }

  step() {
    if (this.done)
      return;

    this.stepCount += 1;

    // 周りをOpen
    var neighbors = this.getNeighbors(this.head);
    neighbors.forEach((neighbor) => {
      if (!neighbor.canEnter)
        return;
      if (neighbor.state != 'None')
        return;
      // neighborをOpen
      console.log("Open", neighbor.position);
      neighbor.state = 'Open';
      neighbor.cost = this.head.cost + 1;
      this.calcEstimateCost(neighbor);
      neighbor.parentNode = this.head;
      this.openList.push(neighbor);
    });

    // 基準ノードをClose
    this.head.state = 'Closed';

    // openList構築（状態管理が面倒くさいので全ノードをなめてしまう…）
    this.openList = [];
    this.nodes.forEach((node) => {
      if (node.state == 'Open' && node.canEnter) {
        this.openList.push(node);
      }
    });
    console.table(this.openList);

    // 次の基準ノードを選定（スコア最小のもの）
    var minScore = 999999;
    var nextHead = null;
    for (var i = 0; i < this.openList.length; i++) {
      if (this.openList[i].score < minScore) {
        nextHead = this.openList[i];
        minScore = this.openList[i].score;
      }
    }
    this.head = nextHead;
    console.log("head", this.head);

    if (this.head.isEqual(this.goalPos)) {
      // ゴール到達！
      alert("発見！");
      var routeIndex = 0;
      var n = this.head;
      while (n) {
        n.routeIndex = routeIndex;
        this.route.push(n);
        n = n.parentNode;
        routeIndex += 1;
      }
      this.route.map((node) => { node.routeIndex = this.route.length - 1 - node.routeIndex; }); // routeIndexを反転させる
      this.done = true;
    }
  }

  calcEstimateCost(node) {
    node.estimateCost = Math.max(Math.abs(this.goalPos.x - node.position.x), Math.abs(this.goalPos.y - node.position.y));
    node.score = node.cost + node.estimateCost;
  }

  getNeighbors(node) {
    var neighbors = [];
    for (var j = 0; j < 5; j++) {
      for (var i = 0; i < 5; i++) {
        if (!(i == node.position.x && j == node.position.y) && Math.abs(i - node.position.x) <= 1 && Math.abs(j - node.position.y) <= 1) {
          neighbors.push(this.getNodeByPosition(new Position(i, j)));
        }
      }
    }
    return neighbors;
  }
}

class Renderer {
  constructor(map) {
    this.map = map;
  }

  render(elem) {
    $('#step').text(this.map.stepCount);

    var html = '';
    html += '<table>';
    for (var j = 0; j < 5; j++) {
      html += '<tr>';
      for (var i = 0; i < 5; i++) {
        var node = this.map.getNodeByPosition(new Position(i, j));
        html += '<td>';
        if (map.startPos.x == i && map.startPos.y == j) {
          html += 'S<BR>';
        } else if (map.goalPos.x == i && map.goalPos.y == j) {
          html += 'G<BR>';
        }
        html += this.getNodeHtml(node);
        html += '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    $(elem).html(html);
  }

  getNodeHtml(node) {
    var html = '';
    if (node.canEnter) {
      if (node.routeIndex) {
        html += '<span style="color: red">' + node.routeIndex + '</span><br>';
      }
      var colors = {
        Open: '#ff0000',
        Closed: '#0000ff',
        None: '#000000',
      }
      html += '<span style="color: ' + colors[node.state] + '">' + node.state + '</span><br>';
      html += node.cost + '<br>';
      html += node.estimateCost + '<br>';
      html += node.score + '<br>';
      return html;
    } else {
      return 'X';
    }
  }
}

var map = new Map(
  [
    new Node(new Position(0, 0), true),
    new Node(new Position(0, 1), true),
    new Node(new Position(0, 2), true),
    new Node(new Position(0, 3), true),
    new Node(new Position(0, 4), true),
    new Node(new Position(1, 0), true),
    new Node(new Position(1, 1), true),
    new Node(new Position(1, 2), true),
    new Node(new Position(1, 3), false),
    new Node(new Position(1, 4), true),
    new Node(new Position(2, 0), true),
    new Node(new Position(2, 1), false),
    new Node(new Position(2, 2), false),
    new Node(new Position(2, 3), false),
    new Node(new Position(2, 4), true),
    new Node(new Position(3, 0), true),
    new Node(new Position(3, 1), true),
    new Node(new Position(3, 2), true),
    new Node(new Position(3, 3), true),
    new Node(new Position(3, 4), true),
    new Node(new Position(4, 0), true),
    new Node(new Position(4, 1), true),
    new Node(new Position(4, 2), false),
    new Node(new Position(4, 3), true),
    new Node(new Position(4, 4), true),
  ],
  new Position(1, 1),
  new Position(4, 4)
);
var renderer = new Renderer(map);
