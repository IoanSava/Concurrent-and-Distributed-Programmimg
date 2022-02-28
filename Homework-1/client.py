import argparse
import socket
import time
import struct

# valid values for optional arguments
PROTOCOLS = ["TCP", "UDP"]
MECHANISMS = ["streaming", "stop-and-wait"]
MESSAGE_SIZE_LOWER_BOUND = 1
MESSAGE_SIZE_UPPER_BOUND = 65535


def build_argument_parser(default_protocol="TCP", default_mechanism="streaming", default_message_size=1024):
    arg_parser = argparse.ArgumentParser()

    # optional arguments
    arg_parser.add_argument("-p", "--protocol",
                            help="Communication protocol: TCP or UDP. Default: {}.".format(default_protocol),
                            default=default_protocol,
                            choices=PROTOCOLS)

    arg_parser.add_argument("-m", "--mechanism",
                            help="Communication mechanism: streaming or stop-and-wait. Default: {}.".format(
                                default_mechanism),
                            default=default_mechanism,
                            choices=MECHANISMS)

    arg_parser.add_argument("-ms", "--message-size",
                            help="Message size in bytes (between {} and {}). Default: {}.".format(
                                MESSAGE_SIZE_LOWER_BOUND, MESSAGE_SIZE_UPPER_BOUND, default_message_size),
                            default=default_message_size,
                            type=int,
                            choices=range(MESSAGE_SIZE_LOWER_BOUND, MESSAGE_SIZE_UPPER_BOUND + 1),
                            metavar="[{}, {}]".format(MESSAGE_SIZE_LOWER_BOUND, MESSAGE_SIZE_UPPER_BOUND))

    # mandatory arguments
    arg_parser.add_argument("-f", "--file",
                            help="File to send to the server.",
                            required=True)

    arg_parser.add_argument("--server-host",
                            help="Server host.",
                            required=True)

    arg_parser.add_argument("--server-port",
                            help="Server port.",
                            type=int,
                            required=True)

    arg_parser.add_argument("--client-host",
                            help="Client host.",
                            required=True)

    arg_parser.add_argument("--client-port",
                            help="Client port.",
                            type=int,
                            required=True)

    return arg_parser


class UDPClient(object):
    def __init__(self, server_address, address, path_to_file, msg_size, used_mechanism):
        self.server_address = server_address
        self.address = address
        self.path_to_file = path_to_file
        self.msg_size = msg_size
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.ack_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.ack_socket.bind(self.address)
        self.ack_socket.settimeout(3)

        if used_mechanism == "streaming":
            self.send_file = self.__send_file_streaming
        else:
            self.send_file = self.__send_file_stop_and_wait

    def __send_file_streaming(self):
        number_of_sent_messages = 0
        number_of_sent_bytes = 0

        file = open(self.path_to_file, "rb")

        start_transmission_time = time.time()

        while True:
            data = file.read(self.msg_size)
            self.socket.sendto(data, self.server_address)
            number_of_sent_bytes += len(data)
            number_of_sent_messages += 1
            if not data:
                self.socket.close()
                break

        end_transmission_time = time.time()

        file.close()

        transmission_time = end_transmission_time - start_transmission_time
        print("[CLIENT][INFO] Transmission time: {} seconds".format(transmission_time))
        print("[CLIENT][INFO] Number of sent messages: {}".format(number_of_sent_messages))
        print("[CLIENT][INFO] Number of sent bytes: {}".format(number_of_sent_bytes))

    def __send_file_stop_and_wait(self):
        number_of_sent_messages = 0
        number_of_sent_bytes = 0

        file = open(self.path_to_file, "rb")

        start_transmission_time = time.time()

        while True:
            data = file.read(self.msg_size)
            self.socket.sendto(data, self.server_address)
            number_of_sent_bytes += len(data)
            number_of_sent_messages += 1

            message_to_confirm = -1
            while message_to_confirm != number_of_sent_messages:
                try:
                    message_confirmation_data = self.ack_socket.recv(self.msg_size)
                    message_to_confirm = struct.unpack("!i", message_confirmation_data)[0]
                except socket.timeout:
                    self.socket.sendto(data, self.server_address)

            if not data:
                self.socket.close()
                break

        end_transmission_time = time.time()

        file.close()

        transmission_time = end_transmission_time - start_transmission_time
        print("[CLIENT][INFO] Transmission time: {} seconds".format(transmission_time))
        print("[CLIENT][INFO] Number of sent messages: {}".format(number_of_sent_messages))
        print("[CLIENT][INFO] Number of sent bytes: {}".format(number_of_sent_bytes))


class TCPClient(object):
    def __init__(self, server_address, path_to_file, msg_size, used_mechanism):
        self.path_to_file = path_to_file
        self.msg_size = msg_size

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.connect(server_address)

        if used_mechanism == "streaming":
            self.send_file = self.__send_file_streaming
        else:
            self.send_file = self.__send_file_stop_and_wait

    def __send_file_streaming(self):
        number_of_sent_messages = 0
        number_of_sent_bytes = 0

        file = open(self.path_to_file, "rb")

        start_transmission_time = time.time()

        while True:
            data = file.read(self.msg_size)
            self.socket.send(data)
            number_of_sent_bytes += len(data)
            number_of_sent_messages += 1
            if not data:
                self.socket.close()
                break

        end_transmission_time = time.time()

        file.close()

        transmission_time = end_transmission_time - start_transmission_time
        print("[CLIENT][INFO] Transmission time: {} seconds".format(transmission_time))
        print("[CLIENT][INFO] Number of sent messages: {}".format(number_of_sent_messages))
        print("[CLIENT][INFO] Number of sent bytes: {}".format(number_of_sent_bytes))

    def __send_file_stop_and_wait(self):
        number_of_sent_messages = 0
        number_of_sent_bytes = 0

        file = open(self.path_to_file, "rb")

        start_transmission_time = time.time()

        while True:
            data = file.read(self.msg_size)
            self.socket.send(data)
            number_of_sent_bytes += len(data)
            number_of_sent_messages += 1

            if not data:
                self.socket.close()
                break

            message_to_confirm = -1
            while message_to_confirm != number_of_sent_messages:
                try:
                    message_confirmation_data = self.socket.recv(self.msg_size)
                    message_to_confirm = struct.unpack("!i", message_confirmation_data)[0]
                except socket.timeout:
                    self.socket.send(data)

        end_transmission_time = time.time()

        file.close()

        transmission_time = end_transmission_time - start_transmission_time
        print("[CLIENT][INFO] Transmission time: {} seconds".format(transmission_time))
        print("[CLIENT][INFO] Number of sent messages: {}".format(number_of_sent_messages))
        print("[CLIENT][INFO] Number of sent bytes: {}".format(number_of_sent_bytes))


if __name__ == '__main__':
    argument_parser = build_argument_parser()
    arguments = argument_parser.parse_args()
    print("[SERVER][INFO] Received arguments: {}".format(arguments))

    protocol = arguments.protocol
    mechanism = arguments.mechanism
    message_size = arguments.message_size

    file_path = arguments.file
    server_host = arguments.server_host
    server_port = arguments.server_port
    client_host = arguments.client_host
    client_port = arguments.client_port

    if protocol == "UDP":
        UDPClient((server_host, server_port), (client_host, client_port), file_path, message_size,
                  mechanism).send_file()
    else:
        TCPClient((server_host, server_port), file_path, message_size, mechanism).send_file()
