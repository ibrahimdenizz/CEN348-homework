import pandas as pd
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import f1_score, accuracy_score
import warnings

warnings.filterwarnings("ignore")


def printInfo(activation, clf, pred, output):
    print("Information of " + activation)
    print("   Accuracy score : " + str(accuracy_score(output, pred)))
    print("         F1 score : " + str(f1_score(output, pred, average="micro")))
    print("Number of outputs : " + str(clf.n_outputs_))
    print("Number of layers : " + str(clf.n_layers_))
    print("Loss values according to iteration :")
    for i in range(10):
        print(i+1, end="       ")
    print(end="\n")
    for i in range(10):
        print("{:.4f}".format(clf.loss_curve_[i]), end="  ")
    print("\n")


def run_ANN(activation, training_data, training_output, test_data, test_output):
    print("Start training of " + activation)
    clf = MLPClassifier(hidden_layer_sizes=(
        100,), activation=activation, max_iter=1, warm_start=True)
    for i in range(10):
        clf.fit(training_data, training_output)
    print("Finish training of " + activation)
    print("Start test of " + activation)
    # accuracy = clf.score(test_data, test_output)
    test_predict = clf.predict(test_data)
    print("Finish test of " + activation, end="\n\n")

    printInfo(activation, clf, test_predict, test_output)


def read_file(path, name):
    data = pd.read_csv(path)
    output = data.loc[:, "label"]
    del data["label"]
    print("Read " + name + " data")
    return data, output


# read training data
training_data, training_output = read_file(
    "./MNISTDataset/mnist_train.csv", "training")

# read test data
test_data, test_output = read_file("./MNISTDataset/mnist_test.csv", "test")


run_ANN("relu", training_data, training_output, test_data, test_output)
run_ANN("logistic", training_data, training_output, test_data, test_output)
run_ANN("tanh", training_data, training_output, test_data, test_output)
